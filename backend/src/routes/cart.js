import express from 'express';
import crypto from 'crypto';
import { db } from '../db/index.js';
import { cart, cartItems, products, coupons, couponUsages, users, loyaltySettings } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// GET /api/cart
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    let userCart = await db.select().from(cart).where(eq(cart.userId, userId)).limit(1);
    
    if (userCart.length === 0) {
      return res.json({ success: true, data: { items: [], total: 0 } });
    }

    const itemsRows = await db.select({
      cartItem: cartItems,
      product: products
    }).from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.cartId, userCart[0].id));
      
    const items = itemsRows.map(row => ({
      ...row.cartItem,
      product: row.product
    }));
    
    // Calculate total amount
    const totalAmount = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    res.json({ success: true, data: { cart: userCart[0], items, totalAmount } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error', code: 'SERVER_ERROR' });
  }
});

// POST /api/cart/items
router.post('/items', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    if (!productId || quantity <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid product or quantity', code: 'BAD_REQUEST' });
    }

    const productRecord = await db.select().from(products).where(eq(products.id, productId)).limit(1);
    if (productRecord.length === 0 || productRecord[0].stock < quantity) {
      return res.status(400).json({ success: false, message: 'Product unavailable or insufficient stock', code: 'BAD_REQUEST' });
    }

    let userCart = await db.select().from(cart).where(eq(cart.userId, userId)).limit(1);
    let cartId;

    if (userCart.length === 0) {
      cartId = crypto.randomUUID();
      await db.insert(cart).values({ id: cartId, userId, createdAt: new Date() });
    } else {
      cartId = userCart[0].id;
    }

    const existingItem = await db.select().from(cartItems).where(and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId))).limit(1);

    if (existingItem.length > 0) {
      // Actualizar cantidad
      const newQuantity = existingItem[0].quantity + quantity;
      if (productRecord[0].stock < newQuantity) {
        return res.status(400).json({ success: false, message: 'Insufficient stock', code: 'BAD_REQUEST' });
      }
      await db.update(cartItems)
        .set({ quantity: newQuantity, price: productRecord[0].price })
        .where(eq(cartItems.id, existingItem[0].id));
    } else {
      // Insertar nuevo item
      await db.insert(cartItems).values({
        id: crypto.randomUUID(),
        cartId,
        productId,
        quantity,
        price: productRecord[0].price,
      });
    }

    res.status(200).json({ success: true, message: 'Item added to cart' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error', code: 'SERVER_ERROR' });
  }
});

// PUT /api/cart/items/:id
router.put('/items/:id', authenticate, async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) return res.status(400).json({ success: false, message: 'Invalid quantity' });
    await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, req.params.id));
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false });
  }
});

// DELETE /api/cart/items/:id
router.delete('/items/:id', authenticate, async (req, res) => {
  try {
    await db.delete(cartItems).where(eq(cartItems.id, req.params.id));
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false });
  }
});

// POST /api/cart/coupon
router.post('/coupon', authenticate, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Código requerido' });
    
    const couponResult = await db.select().from(coupons).where(and(eq(coupons.code, code.toUpperCase()), eq(coupons.active, true))).limit(1);
    
    if (couponResult.length === 0) {
      return res.status(404).json({ success: false, message: 'Cupón no válido o inactivo' });
    }

    const coupon = couponResult[0];

    if (coupon.targetUserId && coupon.targetUserId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Este cupón no te pertenece' });
    }

    // Check expiration
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return res.status(400).json({ success: false, message: 'El cupón ha expirado' });
    }

    // Check single usage per user
    const usageResult = await db.select().from(couponUsages).where(
      and(eq(couponUsages.couponId, coupon.id), eq(couponUsages.userId, req.user.id))
    ).limit(1);

    if (usageResult.length > 0) {
      return res.status(400).json({ success: false, message: 'Ya has utilizado este cupón anteriormente' });
    }

    res.json({ success: true, data: coupon });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Error interno' });
  }
});

// POST /api/cart/redeem-points
router.post('/redeem-points', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const settingsResult = await db.select().from(loyaltySettings).limit(1);
    if (settingsResult.length === 0) return res.status(400).json({ success: false, message: 'Programa de puntos no configurado' });
    const settings = settingsResult[0];

    const userRec = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (userRec.length === 0) return res.status(404).json({ success: false });
    const user = userRec[0];
    const userPoints = user.points || 0;

    if (userPoints < settings.minPointsToRedeem) {
      return res.status(400).json({ success: false, message: `Necesitas al menos ${settings.minPointsToRedeem} puntos para canjear.` });
    }

    const discountAmount = userPoints * settings.discountPerPoint;
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();

    // Create a coupon just for this user
    await db.insert(coupons).values({
      id: crypto.randomUUID(),
      name: 'Gift Card por Puntos',
      code,
      discountAmount,
      targetUserId: userId,
      createdAt: new Date()
    });

    // Deduct points
    await db.update(users).set({ points: 0 }).where(eq(users.id, userId));

    res.json({ success: true, data: { code, discountAmount } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Error interno' });
  }
});

export default router;
