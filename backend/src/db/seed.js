import 'dotenv/config';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { eq } from 'drizzle-orm';
import { db } from './index.js';
import { users, categories, products, banners, loyaltySettings, cartItems, orderItems } from './schema.js';
import { hashPassword } from '../utils/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runSeed() {
  console.log('🌸 Iniciando Seed para UNICA Perfumería...');

  try {
    // 1. Usuario Administrador Único
    const adminPass = await hashPassword('mendo1234');
    const existingAdmin = await db.select().from(users).where(eq(users.email, 'unica.perfumeria.mz@gmail.com')).limit(1);
    if (existingAdmin.length > 0) {
      await db.update(users).set({
        passwordHash: adminPass,
        role: 'ADMIN',
        name: 'UNICA Perfumería'
      }).where(eq(users.email, 'unica.perfumeria.mz@gmail.com'));
    } else {
      await db.insert(users).values({
        id: crypto.randomUUID(),
        name: 'UNICA Perfumería',
        email: 'unica.perfumeria.mz@gmail.com',
        passwordHash: adminPass,
        role: 'ADMIN',
        points: 0,
        createdAt: new Date(),
      }).onConflictDoNothing();
    }
    console.log('✅ Usuario administrador único listo: unica.perfumeria.mz@gmail.com');

    // 2. Cargar Catálogo UNICA 50
    const catalogPath = path.join(__dirname, 'catalog_unica_50.json');
    if (!fs.existsSync(catalogPath)) {
      throw new Error(`No se encontró el archivo de catálogo en: ${catalogPath}`);
    }

    const catalogRaw = fs.readFileSync(catalogPath, 'utf-8');
    const catalog = JSON.parse(catalogRaw);

    // 3. Limpiar productos antiguos y sincronizar Categorías
    await db.delete(cartItems);
    await db.delete(orderItems);
    await db.delete(products);
    await db.delete(categories);

    const categoryMap = new Map();
    for (const cat of catalog.categories) {
      const catId = crypto.randomUUID();
      await db.insert(categories).values({
        id: catId,
        name: cat.name,
        slug: cat.slug,
        createdAt: new Date(),
      }).onConflictDoNothing();
      categoryMap.set(cat.slug, catId);
    }
    console.log(`✅ ${categoryMap.size} Categorías sincronizadas`);

    // 4. Insertar Productos Auditados en lotes
    let insertedCount = 0;
    const toInsert = [];
    for (const prod of catalog.products) {
      const catId = categoryMap.get(prod.category_slug) || Array.from(categoryMap.values())[0];

      toInsert.push({
        id: crypto.randomUUID(),
        name: prod.name,
        slug: prod.slug + '-' + prod.sku.toLowerCase(),
        description: prod.description,
        price: prod.price,
        promotionalPrice: prod.promotional_price,
        stock: prod.stock || 45,
        points: prod.points || 0,
        sku: prod.sku,
        imageUrl: prod.imageUrl,
        categoryId: catId,
        views: 0,
        salesCount: 0,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Insertar en chunks optimizados
    const chunkSize = 25;
    for (let i = 0; i < toInsert.length; i += chunkSize) {
      const chunk = toInsert.slice(i, i + chunkSize);
      await db.insert(products).values(chunk).onConflictDoNothing();
      insertedCount += chunk.length;
    }
    console.log(`✅ ${insertedCount} Productos insertados del catálogo auditado (${catalog.products.length} totales en catálogo)`);

    // 5. Banners para la tienda UNICA Perfumería
    await db.delete(banners);
    await db.insert(banners).values([
      {
        id: crypto.randomUUID(),
        title: "Lanzamiento UNICA Premium: Estilo Born in Roma",
        subtitle: "Descubrí la nueva creación con neceser y perfumero de regalo. Edición Nº 50.",
        buttonText: "Ver Lanzamiento",
        buttonLink: "/product/MBRUPP",
        imageUrl: "/catalog/page_2.jpg",
        active: true,
        createdAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        title: "Alta Perfumería Árabe: Estilo Torino 24",
        subtitle: "120 ml de puro lujo oriental con notas de mango, bergamota y ciruela.",
        buttonText: "Explorar Línea Árabe",
        buttonLink: "/product/UTO24",
        imageUrl: "/catalog/page_3.jpg",
        active: true,
        createdAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        title: "Lanzamiento Especial: La Vida es Bella L'Elixir",
        subtitle: "90 ml con neceser UNICA y perfumero recargable de regalo.",
        buttonText: "Ver Lanzamiento",
        buttonLink: "/product/FVBLE",
        imageUrl: "/catalog/page_86.jpg",
        active: true,
        createdAt: new Date(),
      }
    ]);
    console.log('✅ Banners promocionales actualizados con enlaces directos verificados');

    // 6. Configuración de Fidelidad (Puntos)
    const existingLoyalty = await db.select().from(loyaltySettings).all();
    if (existingLoyalty.length === 0) {
      await db.insert(loyaltySettings).values({
        id: crypto.randomUUID(),
        pointsPerArs: 0.1, // 1 punto cada 10 pesos
        minPointsToRedeem: 500,
        discountPerPoint: 1, // 1 punto = 1 ARS de descuento
        isReferralProgramActive: true,
      });
      console.log('✅ Configuración de fidelidad y puntos inicializada');
    }

    console.log('✨ Seed de UNICA Perfumería finalizado con éxito total.');
  } catch (error) {
    console.error('❌ Error en seed:', error);
    throw error;
  }
}

// Ejecución directa si se llama con `node src/db/seed.js`
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  runSeed().then(() => process.exit(0)).catch(() => process.exit(1));
}
