import 'dotenv/config';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './index.js';
import { users, categories, products, banners, loyaltySettings } from './schema.js';
import { hashPassword } from '../utils/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runSeed() {
  console.log('🌸 Iniciando Seed para ÚNICA Perfumería...');

  try {
    // 1. Usuarios Administradores
    const adminPass = await hashPassword('admin123');
    await db.insert(users).values([
      {
        id: crypto.randomUUID(),
        name: 'Administrador ÚNICA',
        email: 'admin@unicaperfumeria.com',
        passwordHash: adminPass,
        role: 'ADMIN',
        points: 5000,
        createdAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        name: 'Admin Global',
        email: 'admin@tienda.com',
        passwordHash: adminPass,
        role: 'ADMIN',
        points: 5000,
        createdAt: new Date(),
      }
    ]).onConflictDoNothing();
    console.log('✅ Usuarios administradores listos');

    // 2. Cargar Catálogo UNICA 50
    const catalogPath = path.join(__dirname, 'catalog_unica_50.json');
    if (!fs.existsSync(catalogPath)) {
      throw new Error(`No se encontró el archivo de catálogo en: ${catalogPath}`);
    }

    const catalogRaw = fs.readFileSync(catalogPath, 'utf-8');
    const catalog = JSON.parse(catalogRaw);

    // 3. Insertar o actualizar Categorías
    const categoryMap = new Map();
    for (const cat of catalog.categories) {
      const existing = await db.select().from(categories).all();
      const match = existing.find(c => c.slug === cat.slug);
      let catId;
      if (match) {
        catId = match.id;
      } else {
        catId = crypto.randomUUID();
        await db.insert(categories).values({
          id: catId,
          name: cat.name,
          slug: cat.slug,
          createdAt: new Date(),
        }).onConflictDoNothing();
      }
      categoryMap.set(cat.slug, catId);
    }
    console.log(`✅ ${categoryMap.size} Categorías sincronizadas`);

    // 4. Insertar Productos en lotes
    let insertedCount = 0;
    const existingProducts = await db.select().from(products).all();
    const existingSkuMap = new Set(existingProducts.map(p => p.sku));

    for (const prod of catalog.products) {
      if (existingSkuMap.has(prod.sku)) {
        continue;
      }

      const catId = categoryMap.get(prod.category_slug) || Array.from(categoryMap.values())[0];

      await db.insert(products).values({
        id: crypto.randomUUID(),
        name: prod.name,
        slug: prod.slug + '-' + prod.sku.toLowerCase(),
        description: prod.description,
        price: prod.price,
        promotionalPrice: prod.promotional_price,
        stock: prod.stock || 40,
        points: prod.points || Math.round(prod.price * 0.1),
        sku: prod.sku,
        imageUrl: prod.imageUrl,
        categoryId: catId,
        views: Math.floor(Math.random() * 50) + 10,
        salesCount: Math.floor(Math.random() * 15),
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).onConflictDoNothing();

      existingSkuMap.add(prod.sku);
      insertedCount++;
    }
    console.log(`✅ ${insertedCount} Productos insertados del catálogo (${catalog.products.length} totales en catálogo)`);

    // 5. Banners para la tienda ÚNICA Perfumería
    const existingBanners = await db.select().from(banners).all();
    if (existingBanners.length === 0) {
      await db.insert(banners).values([
        {
          id: crypto.randomUUID(),
          title: "Lanzamiento Única Premium: Estilo Born in Roma",
          subtitle: "Descubrí la nueva creación con neceser y perfumero de regalo. Edición Nº 50.",
          buttonText: "Ver Lanzamiento",
          buttonLink: "/#catalogo",
          imageUrl: "/catalog/page_2.jpg",
          active: true,
          createdAt: new Date(),
        },
        {
          id: crypto.randomUUID(),
          title: "Alta Perfumería Árabe: Estilo Torino 24",
          subtitle: "120 ml de puro lujo oriental con notas de mango, bergamota y ciruela.",
          buttonText: "Explorar Línea Árabe",
          buttonLink: "/#catalogo",
          imageUrl: "/catalog/page_3.jpg",
          active: true,
          createdAt: new Date(),
        },
        {
          id: crypto.randomUUID(),
          title: "Esencialmente Bueno: Edición Especial Nº 50",
          subtitle: "Fragancias de alta graduación, difusores para el hogar y aromaterapia Sumeria.",
          buttonText: "Comprar Ahora",
          buttonLink: "/#catalogo",
          imageUrl: "/catalog/page_86.jpg",
          active: true,
          createdAt: new Date(),
        }
      ]);
      console.log('✅ Banners promocionales creados');
    }

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

    console.log('✨ Seed de ÚNICA Perfumería finalizado con éxito total.');
  } catch (error) {
    console.error('❌ Error en seed:', error);
    throw error;
  }
}

// Ejecución directa si se llama con `node src/db/seed.js`
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  runSeed().then(() => process.exit(0)).catch(() => process.exit(1));
}
