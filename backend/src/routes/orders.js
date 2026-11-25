import express from 'express';
import { db } from '../db/index.js';
import { orders, orderItems, products } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// GET /api/orders
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const userOrders = await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
    
    res.json({ success: true, data: userOrders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/orders/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const orderData = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    
    if (orderData.length === 0 || orderData[0].userId !== userId) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const itemsData = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
    // Falta el JOIN con products para mostrar datos más ricos

    res.json({ success: true, data: { order: orderData[0], items: itemsData } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// DELETE /api/orders/:id
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Verify order belongs to user
    const orderData = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    if (orderData.length === 0 || orderData[0].userId !== userId) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Delete items first (foreign key workaround)
    await db.delete(orderItems).where(eq(orderItems.orderId, id));
    // Delete order
    await db.delete(orders).where(eq(orders.id, id));

    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// DELETE /api/orders
router.delete('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const userOrders = await db.select().from(orders).where(eq(orders.userId, userId));
    for (const order of userOrders) {
      await db.delete(orderItems).where(eq(orderItems.orderId, order.id));
    }
    
    await db.delete(orders).where(eq(orders.userId, userId));

    res.json({ success: true, message: 'Order history cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
