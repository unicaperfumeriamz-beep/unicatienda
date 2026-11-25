import express from 'express';
import crypto from 'crypto';
import { db } from '../db/index.js';
import { products, categories, productComments, users, dailyAnalytics } from '../db/schema.js';
import { eq, like, and, sql } from 'drizzle-orm';
import { authenticate, requireRole } from '../middlewares/auth.js';

const router = express.Router();

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    
    let query = db.select().from(products).where(eq(products.active, true));

    if (search) {
      query = query.where(like(products.name, `%${search}%`));
    }
    
    if (category) {
      // Falta join para filtrar por categoría slug, simplificado por id
      query = query.where(eq(products.categoryId, category));
    }

    const result = await query;
    res.json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error', code: 'SERVER_ERROR' });
  }
});

// GET /api/products/:idOrSlug
router.get('/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const result = await db.select().from(products)
      .where(sql`${products.id} = ${idOrSlug} OR ${products.slug} = ${idOrSlug}`)
      .limit(1);
    
    if (result.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found', code: 'NOT_FOUND' });
    }

    const prod = result[0];
    const newViews = (prod.views || 0) + 1;
    
    // Incrementar vistas del producto
    await db.update(products).set({ views: newViews }).where(eq(products.id, prod.id));

    // Registrar en estadísticas diarias
    try {
      const today = new Date().toISOString().slice(0, 10);
      const existing = await db.select().from(dailyAnalytics).where(eq(dailyAnalytics.date, today)).limit(1);
      if (existing.length > 0) {
        await db.update(dailyAnalytics).set({
          productViews: (existing[0].productViews || 0) + 1,
          visits: (existing[0].visits || 0) + 1
        }).where(eq(dailyAnalytics.date, today));
      } else {
        await db.insert(dailyAnalytics).values({
          date: today,
          visits: 1,
          productViews: 1,
          ordersCount: 0,
          revenue: 0
        });
      }
    } catch (metricErr) {
      console.warn('dailyAnalytics increment error:', metricErr.message);
    }

    res.json({ success: true, data: { ...prod, views: newViews } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error', code: 'SERVER_ERROR' });
  }
});

// ADMIN: POST /api/products
router.post('/', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const { name, slug, description, price, stock, categoryId } = req.body;
    
    if (!name || !slug || !price) {
      return res.status(400).json({ success: false, message: 'Missing fields', code: 'BAD_REQUEST' });
    }

    const id = crypto.randomUUID();
    await db.insert(products).values({
      id,
      name,
      slug,
      description: description || '',
      price,
      stock: stock || 0,
      categoryId,
      createdAt: new Date(),
    });

    res.status(201).json({ success: true, message: 'Product created successfully', data: { id } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error', code: 'SERVER_ERROR' });
  }
});

// GET /api/products/:id/comments
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await db.select({
      id: productComments.id,
      text: productComments.text,
      rating: productComments.rating,
      createdAt: productComments.createdAt,
      userName: users.name
    })
    .from(productComments)
    .innerJoin(users, eq(productComments.userId, users.id))
    .where(eq(productComments.productId, req.params.id));
    
    res.json({ success: true, data: comments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching comments' });
  }
});

// POST /api/products/:id/comments
router.post('/:id/comments', authenticate, async (req, res) => {
  try {
    const { text, rating } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'Text is required' });

    const id = crypto.randomUUID();
    await db.insert(productComments).values({
      id,
      productId: req.params.id,
      userId: req.user.id,
      text,
      rating: parseInt(rating) || 5,
      createdAt: new Date()
    });

    res.json({ success: true, data: { id } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating comment' });
  }
});

export default router;
