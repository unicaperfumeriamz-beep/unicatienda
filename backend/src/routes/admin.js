import express from 'express';
import { db } from '../db/index.js';
import { products, orders, orderItems, users, categories, banners, coupons, loyaltySettings, dailyAnalytics, cart, cartItems, productComments } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { sql, count } from 'drizzle-orm';
import { authenticate, requireRole } from '../middlewares/auth.js';

const router = express.Router();

// GET /api/admin/metrics
router.get('/metrics', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const allUsers = await db.select().from(users);
    const allOrders = await db.select().from(orders);
    const allProducts = await db.select().from(products);
    const allCategories = await db.select().from(categories);
    const allDaily = await db.select().from(dailyAnalytics);
    const allCarts = await db.select({ count: count() }).from(cart);

    const approvedOrders = allOrders.filter(o => o.paymentStatus === 'APPROVED');
    const pendingOrders = allOrders.filter(o => o.paymentStatus === 'PENDING' || o.status === 'PENDING_PAYMENT');
    const totalRevenue = approvedOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

    const totalProductViews = allProducts.reduce((sum, p) => sum + (p.views || 0), 0);
    const totalSalesUnits = allProducts.reduce((sum, p) => sum + (p.salesCount || 0), 0);
    const totalVisitsCount = allDaily.reduce((sum, item) => sum + (item.visits || 0), 0);

    // Días de la semana para gráfico de los últimos 7 días
    const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const trafficHistory = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayName = daysOfWeek[d.getDay()];
      const dayData = allDaily.find(item => item.date === dateStr);

      // Órdenes de ese día
      const dayOrders = approvedOrders.filter(o => {
        if (!o.createdAt) return false;
        const oDate = new Date(o.createdAt).toISOString().slice(0, 10);
        return oDate === dateStr;
      });
      const dayRevenue = dayOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

      trafficHistory.push({
        date: dateStr,
        name: dayName,
        visitas: dayData?.visits || 0,
        vistas: dayData?.productViews || 0,
        ingresos: dayRevenue || (dayData?.revenue || 0),
        pedidos: dayOrders.length || (dayData?.ordersCount || 0)
      });
    }

    // Top productos por visualizaciones (interés del cliente)
    const topProductsByViews = [...allProducts]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 8)
      .map(p => {
        const cat = allCategories.find(c => c.id === p.categoryId);
        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          categoryName: cat?.name || 'General',
          price: p.price,
          stock: p.stock,
          imageUrl: p.imageUrl,
          views: p.views || 0,
          salesCount: p.salesCount || 0,
          revenue: (p.salesCount || 0) * (p.price || 0),
          conversionRate: p.views > 0 ? (((p.salesCount || 0) / p.views) * 100).toFixed(1) + '%' : '0%'
        };
      });

    // Top productos por ventas concretadas
    const topProductsBySales = [...allProducts]
      .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
      .slice(0, 8)
      .map(p => {
        const cat = allCategories.find(c => c.id === p.categoryId);
        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          categoryName: cat?.name || 'General',
          price: p.price,
          stock: p.stock,
          imageUrl: p.imageUrl,
          views: p.views || 0,
          salesCount: p.salesCount || 0,
          revenue: (p.salesCount || 0) * (p.price || 0)
        };
      });

    // Distribución por categoría
    const categoryDistribution = allCategories.map(cat => {
      const catProducts = allProducts.filter(p => p.categoryId === cat.id);
      const catViews = catProducts.reduce((sum, p) => sum + (p.views || 0), 0);
      const catSales = catProducts.reduce((sum, p) => sum + (p.salesCount || 0), 0);
      const catRevenue = catProducts.reduce((sum, p) => sum + (p.salesCount || 0) * (p.price || 0), 0);

      return {
        id: cat.id,
        name: cat.name,
        productsCount: catProducts.length,
        views: catViews,
        salesCount: catSales,
        revenue: catRevenue,
        value: catProducts.length // Para PieChart
      };
    });

    // Embudo de conversión
    const cartsCount = allCarts[0]?.count || 0;
    const funnel = [
      { step: 'Visitas a la Web', count: Math.max(totalVisitsCount, 1), label: 'Tráfico total' },
      { step: 'Vistas de Producto', count: totalProductViews, label: 'Interés activo' },
      { step: 'Carritos Iniciados', count: cartsCount + approvedOrders.length, label: 'Intención de compra' },
      { step: 'Ventas Concretadas', count: approvedOrders.length, label: 'Conversión final' }
    ];

    const conversionRate = totalVisitsCount > 0 
      ? ((approvedOrders.length / totalVisitsCount) * 100).toFixed(1) + '%'
      : '0.0%';

    const averageTicket = approvedOrders.length > 0 
      ? (totalRevenue / approvedOrders.length).toFixed(2)
      : '0.00';

    const summaryData = {
        revenue: totalRevenue,
        orders: approvedOrders.length,
        pendingOrders: pendingOrders.length,
        users: allUsers.length,
        products: allProducts.length,
        totalVisits: totalVisitsCount,
        totalProductViews: totalProductViews,
        totalSalesUnits: totalSalesUnits,
        conversionRate,
        averageTicket
      };

      res.json({
        success: true,
        data: {
          ...summaryData,
          summary: summaryData,
          trafficHistory,
          topProductsByViews,
          topProductsBySales,
          categoryDistribution,
          funnel
        }
      });
  } catch (error) {
    console.error('Error in /api/admin/metrics:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET endpoints
router.get('/users', authenticate, requireRole('ADMIN'), async (req, res) => {
  const allUsers = await db.select().from(users);
  const allOrders = await db.select().from(orders);

  const data = allUsers.map(user => {
    const userOrders = allOrders.filter(o => o.userId === user.id && o.paymentStatus === 'APPROVED');
    const totalSpent = userOrders.reduce((acc, curr) => acc + curr.totalAmount, 0);
    const referralsCount = allUsers.filter(u => u.referredBy === user.id).length;
    return { ...user, totalSpent, referralsCount };
  });

  res.json({ success: true, data });
});

router.get('/categories', authenticate, requireRole('ADMIN'), async (req, res) => {
  const data = await db.select().from(categories);
  res.json({ success: true, data });
});

router.get('/products', authenticate, requireRole('ADMIN'), async (req, res) => {
  const data = await db.select().from(products);
  res.json({ success: true, data });
});

// POST Categories
router.post('/categories', authenticate, requireRole('ADMIN'), async (req, res) => {
  const { name, slug } = req.body;
  if (!name || !slug) return res.status(400).json({ success: false });
  try {
    await db.insert(categories).values({ id: crypto.randomUUID(), name, slug, createdAt: new Date() });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// POST Products
router.post('/products', authenticate, requireRole('ADMIN'), async (req, res) => {
  const { name, slug, description, price, stock, categoryId, imageUrl, points } = req.body;
  if (!name || !price) return res.status(400).json({ success: false });
  try {
    await db.insert(products).values({ 
      id: crypto.randomUUID(), name, slug, description: description || '', 
      price: parseFloat(price), stock: parseInt(stock) || 0, categoryId, imageUrl, points: parseInt(points) || 0, createdAt: new Date() 
    });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// PUT Categories
router.put('/categories/:id', authenticate, requireRole('ADMIN'), async (req, res) => {
  const { name, slug } = req.body;
  try {
    await db.update(categories).set({ name, slug }).where(eq(categories.id, req.params.id));
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// PUT Products
router.put('/products/:id', authenticate, requireRole('ADMIN'), async (req, res) => {
  const { name, slug, description, price, stock, categoryId, imageUrl, points } = req.body;
  try {
    await db.update(products).set({ 
      name, slug, description: description || '', 
      price: parseFloat(price), stock: parseInt(stock) || 0, categoryId, imageUrl, points: parseInt(points) || 0
    }).where(eq(products.id, req.params.id));
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// DELETE Categories
router.delete('/categories/:id', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    // Check if category has products
    const linkedProducts = await db.select().from(products).where(eq(products.categoryId, req.params.id)).limit(1);
    if (linkedProducts.length > 0) {
      return res.status(400).json({ success: false, message: 'No se puede eliminar la categoría porque tiene productos asociados.' });
    }
    await db.delete(categories).where(eq(categories.id, req.params.id));
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// DELETE Products (con limpieza en cascada para evitar bloqueos por carritos u órdenes canceladas/pendientes)
router.delete('/products/:id', authenticate, requireRole('ADMIN'), async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Eliminar referencias en carritos
    await db.delete(cartItems).where(eq(cartItems.productId, id));

    // 2. Eliminar comentarios asociados
    await db.delete(productComments).where(eq(productComments.productId, id));

    // 3. Gestionar items de órdenes asociados a este producto
    const linkedOrderItems = await db.select().from(orderItems).where(eq(orderItems.productId, id));
    if (linkedOrderItems.length > 0) {
      const orderIds = [...new Set(linkedOrderItems.map(item => item.orderId))];
      
      // Eliminar los orderItems asociados
      await db.delete(orderItems).where(eq(orderItems.productId, id));

      // Para las órdenes afectadas (compras canceladas/pendientes), si quedan sin items, eliminarlas
      for (const ordId of orderIds) {
        const remaining = await db.select().from(orderItems).where(eq(orderItems.orderId, ordId));
        if (remaining.length === 0) {
          await db.delete(orders).where(eq(orders.id, ordId));
        }
      }
    }

    // 4. Eliminar el producto definitivamente
    await db.delete(products).where(eq(products.id, id));

    res.json({ success: true, message: 'Producto eliminado correctamente' });
  } catch (e) {
    console.error('Error al eliminar producto:', e);
    res.status(500).json({ success: false, message: 'Error al eliminar el producto: ' + (e.message || 'Error de base de datos') });
  }
});

// GET Orders (para gestión de pedidos en Admin)
router.get('/orders', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
    const allUsers = await db.select().from(users);
    const allItems = await db.select().from(orderItems);
    const allProds = await db.select().from(products);

    const data = allOrders.map(order => {
      const user = allUsers.find(u => u.id === order.userId);
      const items = allItems.filter(i => i.orderId === order.id).map(item => {
        const prod = allProds.find(p => p.id === item.productId);
        return {
          ...item,
          productName: prod?.name || 'Producto eliminado',
          productImage: prod?.imageUrl || ''
        };
      });

      return {
        ...order,
        userName: user?.name || 'Cliente desconocido',
        userEmail: user?.email || '',
        items
      };
    });

    res.json({ success: true, data });
  } catch (e) {
    console.error('Error fetching admin orders:', e);
    res.status(500).json({ success: false, message: e.message });
  }
});

// PUT Orders status
router.put('/orders/:id/status', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const updateData = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    updateData.updatedAt = new Date();

    await db.update(orders).set(updateData).where(eq(orders.id, req.params.id));
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// DELETE Order (permite al admin cancelar y eliminar órdenes)
router.delete('/orders/:id', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    await db.delete(orderItems).where(eq(orderItems.orderId, req.params.id));
    await db.delete(orders).where(eq(orders.id, req.params.id));
    res.json({ success: true, message: 'Orden eliminada correctamente' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// GET Banners
router.get('/banners', authenticate, requireRole('ADMIN'), async (req, res) => {
  const result = await db.select().from(banners);
  res.json({ success: true, data: result });
});

// POST Banners
router.post('/banners', authenticate, requireRole('ADMIN'), async (req, res) => {
  const id = crypto.randomUUID();
  const { title, subtitle, buttonText, buttonLink, imageUrl } = req.body;
  await db.insert(banners).values({ id, title, subtitle, buttonText, buttonLink, imageUrl, createdAt: new Date() });
  res.json({ success: true, data: { id } });
});

// PUT Banners
router.put('/banners/:id', authenticate, requireRole('ADMIN'), async (req, res) => {
  const { title, subtitle, buttonText, buttonLink, imageUrl, active } = req.body;
  await db.update(banners).set({ title, subtitle, buttonText, buttonLink, imageUrl, active }).where(eq(banners.id, req.params.id));
  res.json({ success: true });
});

// DELETE Banners
router.delete('/banners/:id', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    await db.delete(banners).where(eq(banners.id, req.params.id));
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// GET Coupons
router.get('/coupons', authenticate, requireRole('ADMIN'), async (req, res) => {
  const result = await db.select().from(coupons);
  res.json({ success: true, data: result });
});

// POST Coupons
router.post('/coupons', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const id = crypto.randomUUID();
    const { name, code, discountPercentage, expiresAt, targetUserEmail } = req.body;
    
    if (!name || !discountPercentage || !code) {
      return res.status(400).json({ success: false, message: 'Nombre, código y porcentaje son obligatorios' });
    }

    let targetUserId = null;
    if (targetUserEmail) {
      const u = await db.select().from(users).where(eq(users.email, targetUserEmail)).limit(1);
      if (u.length > 0) {
        targetUserId = u[0].id;
      } else {
        return res.status(400).json({ success: false, message: 'Usuario no encontrado' });
      }
    }

    await db.insert(coupons).values({ 
      id, 
      name,
      code: code.toUpperCase(), 
      discountPercentage: parseFloat(discountPercentage), 
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      targetUserId,
      createdAt: new Date() 
    });
    res.json({ success: true, data: { id, code: code.toUpperCase() } });
  } catch (error) {
    console.error('Error creating coupon:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT Coupons
router.put('/coupons/:id', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const { name, discountPercentage, active, expiresAt } = req.body;
    await db.update(coupons).set({ 
      name,
      discountPercentage: parseFloat(discountPercentage), 
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      active 
    }).where(eq(coupons.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating coupon:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE Coupons
router.delete('/coupons/:id', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    await db.delete(coupons).where(eq(coupons.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET Loyalty Settings
router.get('/loyalty/settings', authenticate, requireRole('ADMIN'), async (req, res) => {
  let settings = await db.select().from(loyaltySettings).limit(1);
  if (settings.length === 0) {
    const defaultSettings = {
      id: crypto.randomUUID(),
      pointsPerArs: 0.1,
      minPointsToRedeem: 1000,
      discountPerPoint: 1
    };
    await db.insert(loyaltySettings).values(defaultSettings);
    settings = [defaultSettings];
  }
  res.json({ success: true, data: settings[0] });
});

// PUT Loyalty Settings
router.put('/loyalty/settings/:id', authenticate, requireRole('ADMIN'), async (req, res) => {
  const { minPointsToRedeem, isReferralProgramActive } = req.body;
  const updateData = {};
  if (minPointsToRedeem !== undefined) updateData.minPointsToRedeem = parseInt(minPointsToRedeem);
  if (isReferralProgramActive !== undefined) updateData.isReferralProgramActive = !!isReferralProgramActive;

  await db.update(loyaltySettings).set(updateData).where(eq(loyaltySettings.id, req.params.id));
  res.json({ success: true });
});

// POST Modify User Points manually
router.post('/loyalty/users/:id/points', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const { action, amount } = req.body; // action = 'add' or 'deduct'
    const userRec = await db.select().from(users).where(eq(users.id, req.params.id)).limit(1);
    if (userRec.length === 0) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

    let newPoints = userRec[0].points || 0;
    if (action === 'add') {
      newPoints += parseInt(amount);
    } else if (action === 'deduct') {
      newPoints = Math.max(0, newPoints - parseInt(amount));
    }

    await db.update(users).set({ points: newPoints }).where(eq(users.id, req.params.id));
    res.json({ success: true, points: newPoints });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// POST Upload Image (desde ordenador o captura de cámara)
router.post('/upload-image', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const { image, filename } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, message: 'No se envió ninguna imagen' });
    }

    // Procesa Data URL: "data:image/jpeg;base64,/9j/4AAQSkZJRg..." o Base64 puro
    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer;
    let extension = 'jpg';

    if (matches && matches.length === 3) {
      const mimeType = matches[1].toLowerCase();
      if (mimeType.includes('png')) extension = 'png';
      else if (mimeType.includes('webp')) extension = 'webp';
      else if (mimeType.includes('gif')) extension = 'gif';
      else if (mimeType.includes('svg')) extension = 'svg';
      else extension = 'jpg';

      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(image, 'base64');
    }

    const uniqueName = `img-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${extension}`;
    const uploadsDir = path.join(process.cwd(), 'uploads');
    
    await fs.promises.mkdir(uploadsDir, { recursive: true });
    const filePath = path.join(uploadsDir, uniqueName);
    await fs.promises.writeFile(filePath, buffer);

    const baseUrl = process.env.APP_URL ? 'http://localhost:' + (process.env.PORT || 3000) : `http://localhost:${process.env.PORT || 3000}`;
    const imageUrl = `${baseUrl}/uploads/${uniqueName}`;

    res.json({ success: true, imageUrl, filename: uniqueName });
  } catch (error) {
    console.error('Error subiendo imagen:', error);
    res.status(500).json({ success: false, message: 'Error interno al guardar la imagen' });
  }
});

// --- GESTIÓN MENSUAL DEL LIBRO / CATÁLOGO UNICA ---

// GET /api/admin/catalog/status
router.get('/catalog/status', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const allProducts = await db.select().from(products);
    const allCategories = await db.select().from(categories);
    
    const catalogPath = path.join(process.cwd(), 'src/db/catalog_unica_50.json');
    let editionInfo = "UNICA Perfumería - Edición Nº 50";
    if (fs.existsSync(catalogPath)) {
      try {
        const catData = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
        if (catData.edition) editionInfo = catData.edition;
      } catch (e) {}
    }

    const categoriesWithCount = allCategories.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      productCount: allProducts.filter(p => p.categoryId === cat.id).length
    }));

    res.json({
      success: true,
      data: {
        activeEdition: editionInfo,
        totalProducts: allProducts.length,
        categoriesCount: allCategories.length,
        categories: categoriesWithCount,
        lastUpdated: allProducts[0]?.updatedAt || new Date()
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/catalog/sync-defaults (Sincroniza / recarga catálogo oficial)
router.post('/catalog/sync-defaults', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const { runSeed } = await import('../db/seed.js');
    await runSeed();
    const countRes = await db.select().from(products);
    res.json({ success: true, message: 'Catálogo sincronizado exitosamente desde el libro UNICA 50', totalProducts: countRes.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/catalog/import (Carga de nuevo catálogo mensual vía JSON / Array)
router.post('/catalog/import', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const { edition, categories: newCats, products: newProds } = req.body;
    if (!newProds || !Array.isArray(newProds) || newProds.length === 0) {
      return res.status(400).json({ success: false, message: 'No se enviaron productos para importar' });
    }

    // 1. Manejo de categorías
    const existingCats = await db.select().from(categories);
    const catMap = new Map();
    for (const ec of existingCats) {
      catMap.set(ec.slug, ec.id);
    }

    if (newCats && Array.isArray(newCats)) {
      for (const cat of newCats) {
        if (!catMap.has(cat.slug)) {
          const newId = crypto.randomUUID();
          await db.insert(categories).values({
            id: newId,
            name: cat.name,
            slug: cat.slug,
            createdAt: new Date()
          }).onConflictDoNothing();
          catMap.set(cat.slug, newId);
        }
      }
    }

    // 2. Upsert productos
    let updatedCount = 0;
    let insertedCount = 0;
    const defaultCatId = Array.from(catMap.values())[0] || null;

    for (const item of newProds) {
      const sku = (item.sku || `UNI-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`).toUpperCase().trim();
      const catId = (item.category_slug && catMap.get(item.category_slug)) || item.categoryId || defaultCatId;
      
      const existing = await db.select().from(products).where(eq(products.sku, sku)).limit(1);

      if (existing.length > 0) {
        await db.update(products).set({
          name: item.name || existing[0].name,
          price: Number(item.price) || existing[0].price,
          promotionalPrice: item.promotionalPrice !== undefined ? Number(item.promotionalPrice) : (item.promotional_price !== undefined ? Number(item.promotional_price) : existing[0].promotionalPrice),
          description: item.description !== undefined ? item.description : existing[0].description,
          stock: item.stock !== undefined ? Number(item.stock) : existing[0].stock,
          imageUrl: item.imageUrl || existing[0].imageUrl,
          categoryId: catId || existing[0].categoryId,
          active: item.active !== undefined ? item.active : existing[0].active,
          updatedAt: new Date()
        }).where(eq(products.id, existing[0].id));
        updatedCount++;
      } else {
        const prodId = crypto.randomUUID();
        const baseSlug = (item.slug || item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')).replace(/^-|-$/g, '');
        await db.insert(products).values({
          id: prodId,
          name: item.name,
          slug: `${baseSlug}-${sku.toLowerCase()}`,
          description: item.description || '',
          price: Number(item.price) || 0,
          promotionalPrice: item.promotionalPrice ? Number(item.promotionalPrice) : (item.promotional_price ? Number(item.promotional_price) : null),
          stock: Number(item.stock) || 30,
          points: Number(item.points) || Math.round((Number(item.price) || 0) * 0.1),
          sku: sku,
          imageUrl: item.imageUrl || '/catalog/page_2.jpg',
          categoryId: catId,
          active: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        insertedCount++;
      }
    }

    res.json({
      success: true,
      message: `Importación completada: ${insertedCount} agregados, ${updatedCount} actualizados`,
      inserted: insertedCount,
      updated: updatedCount,
      edition: edition || 'Nueva Edición'
    });
  } catch (err) {
    console.error('Error importing catalog:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/catalog/clear (Vaciar catálogo completo a cero)
router.post('/catalog/clear', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    await db.delete(cartItems);
    await db.delete(orderItems);
    await db.delete(productComments);
    await db.delete(products);

    if (req.body.clearCategories) {
      await db.delete(categories);
    }

    res.json({ success: true, message: 'Catálogo limpiado exitosamente. La tienda quedó en cero productos lista para el nuevo libro.' });
  } catch (err) {
    console.error('Error limpiando catálogo:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/catalog/upload-pdf (Cargar PDF del libro directamente)
router.post('/catalog/upload-pdf', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const { pdfBase64, filename, edition } = req.body;
    if (!pdfBase64) {
      return res.status(400).json({ success: false, message: 'No se envió ningún archivo PDF' });
    }

    const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');
    
    const catalogUploadDir = path.join(process.cwd(), 'uploads/catalog');
    await fs.promises.mkdir(catalogUploadDir, { recursive: true });

    const safeName = filename ? filename.replace(/[^a-zA-Z0-9._-]/g, '_') : `libro_${Date.now()}.pdf`;
    const pdfPath = path.join(catalogUploadDir, safeName);
    await fs.promises.writeFile(pdfPath, buffer);
    console.log(`📘 Libro PDF guardado en: ${pdfPath} (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);

    // Sincronizar catálogo oficial
    const { runSeed } = await import('../db/seed.js');
    await runSeed();

    const countRes = await db.select().from(products);
    res.json({
      success: true,
      message: `¡Libro PDF "${safeName}" cargado y procesado exitosamente! Se sincronizaron los productos en la tienda.`,
      filename: safeName,
      totalProducts: countRes.length,
      edition: edition || 'Nueva Edición del Libro'
    });
  } catch (err) {
    console.error('Error procesando PDF del catálogo:', err);
    res.status(500).json({ success: false, message: 'Error procesando PDF: ' + err.message });
  }
});

export default router;
