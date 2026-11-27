import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import cartRoutes from './routes/cart.js';
import checkoutRoutes from './routes/checkout.js';
import ordersRoutes from './routes/orders.js';
import notificationsRoutes from './routes/notifications.js';
import adminRoutes from './routes/admin.js';
import { db } from './db/index.js';
import { banners, categories, dailyAnalytics } from './db/schema.js';
import { eq } from 'drizzle-orm';

import path from 'path';
import fs from 'fs';

dotenv.config();
if (fs.existsSync(path.join(process.cwd(), 'backend/.env'))) {
  dotenv.config({ path: path.join(process.cwd(), 'backend/.env') });
}

const app = express();
const port = process.env.PORT || 3000;

// Ensure uploads directory exists
const uploadsDir = fs.existsSync(path.join(process.cwd(), 'backend'))
  ? path.join(process.cwd(), 'backend/uploads')
  : path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({ 
  origin: (origin, callback) => callback(null, true), 
  credentials: true 
}));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Serve static uploads and catalog
app.use('/uploads', express.static(uploadsDir));
const possibleCatalogDirs = [
  path.join(process.cwd(), 'frontend/public/catalog'),
  path.join(process.cwd(), 'public/catalog'),
  path.join(process.cwd(), '../frontend/public/catalog'),
  path.join(process.cwd(), 'backend/public/catalog')
];
for (const catDir of possibleCatalogDirs) {
  if (fs.existsSync(catDir)) {
    app.use('/catalog', express.static(catDir));
    break;
  }
}

// Rutas base
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

app.get('/api/banners', async (req, res) => {
  try {
    const result = await db.select().from(banners).where(eq(banners.active, true));
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const result = await db.select().from(categories);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/api/analytics/visit', async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const existing = await db.select().from(dailyAnalytics).where(eq(dailyAnalytics.date, today)).limit(1);
    if (existing.length > 0) {
      await db.update(dailyAnalytics).set({ visits: (existing[0].visits || 0) + 1 }).where(eq(dailyAnalytics.date, today));
    } else {
      await db.insert(dailyAnalytics).values({
        date: today,
        visits: 1,
        productViews: 0,
        ordersCount: 0,
        revenue: 0
      });
    }
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false });
  }
});

// Serve Frontend SPA in unified deployment
const possibleDistPaths = [
  path.join(process.cwd(), 'frontend/dist'),
  path.join(process.cwd(), '../frontend/dist'),
  path.join(process.cwd(), 'dist')
];
const frontendDist = possibleDistPaths.find(p => fs.existsSync(p));
if (frontendDist) {
  console.log(`📂 Sirviendo Frontend estático desde: ${frontendDist}`);
  app.use(express.static(frontendDist));
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/catalog')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Start server
app.listen(port, async () => {
  console.log(`🚀 Backend server running on port ${port}`);

  // Auto-seed if database has no products (e.g. freshly created Turso database on Render)
  try {
    const { products } = await import('./db/schema.js');
    const existing = await db.select().from(products).limit(1);
    if (!existing || existing.length === 0) {
      console.log('📦 Base de datos vacía detectada. Ejecutando seed automático de UNICA Perfumería...');
      const { runSeed } = await import('./db/seed.js');
      await runSeed();
    }
  } catch (err) {
    console.warn('Nota sobre inicialización de base de datos:', err.message);
  }
});
