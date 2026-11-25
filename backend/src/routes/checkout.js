import express from 'express';
import crypto from 'crypto';
import { db } from '../db/index.js';
import { cart, cartItems, orders, orderItems, products, coupons, couponUsages, users, loyaltySettings, notifications } from '../db/schema.js';
import { eq, inArray } from 'drizzle-orm';
import { authenticate } from '../middlewares/auth.js';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const mpClient = new MercadoPagoConfig({ accessToken: (process.env.MERCADOPAGO_ACCESS_TOKEN || 'TEST-dummy-token').trim() });

// POST /api/checkout/create-order
router.post('/create-order', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { shippingAddress, couponCode } = req.body;

    if (!shippingAddress) {
      return res.status(400).json({ success: false, message: 'Shipping address is required' });
    }

    // 1. Reconstruir carrito desde DB
    const userCart = await db.select().from(cart).where(eq(cart.userId, userId)).limit(1);
    if (userCart.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    const items = await db.select().from(cartItems).where(eq(cartItems.cartId, userCart[0].id));
    if (items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // 2. Obtener precios actuales y verificar stock
    const productIds = items.map(item => item.productId);
    const dbProducts = await db.select().from(products).where(inArray(products.id, productIds));
    
    let totalAmount = 0;
    let totalPointsAwarded = 0;
    const orderItemsData = [];
    const mpItems = [];

    for (const item of items) {
      const product = dbProducts.find(p => p.id === item.productId);
      if (!product || product.stock < item.quantity || !product.active) {
        return res.status(400).json({ success: false, message: `Product ${product?.name || 'unknown'} is unavailable or out of stock` });
      }

      totalAmount += product.price * item.quantity;
      totalPointsAwarded += (product.points || 0) * item.quantity;
      orderItemsData.push({
        id: crypto.randomUUID(),
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
      });

      mpItems.push({
        id: product.id,
        title: product.name,
        quantity: item.quantity,
        unit_price: product.price,
        currency_id: 'ARS',
      });
    }

    let appliedCouponObj = null;
    if (couponCode) {
      const couponResult = await db.select().from(coupons).where(and(eq(coupons.code, couponCode.toUpperCase()), eq(coupons.active, true))).limit(1);
      if (couponResult.length > 0) {
        const coupon = couponResult[0];
        const isNotExpired = !coupon.expiresAt || new Date(coupon.expiresAt) > new Date();
        const usageResult = await db.select().from(couponUsages).where(
          and(eq(couponUsages.couponId, coupon.id), eq(couponUsages.userId, userId))
        ).limit(1);

        if (isNotExpired && usageResult.length === 0) {
          appliedCouponObj = coupon;
          let discountVal = 0;
          if (coupon.discountPercentage) {
            discountVal = (totalAmount * coupon.discountPercentage) / 100;
          } else if (coupon.discountAmount) {
            discountVal = coupon.discountAmount;
          }
          if (discountVal > totalAmount) discountVal = totalAmount; // Prevent negative total
          
          totalAmount -= discountVal;
          
          // MP Discount mock: reduce the unit price proportionally
          const factor = totalAmount === 0 ? 0 : 1 - (discountVal / (totalAmount + discountVal));
          for (let mi of mpItems) {
            mi.unit_price = Number((mi.unit_price * factor).toFixed(2));
          }
        }
      }
    }

    // 3. Crear Orden en estado PENDING_PAYMENT
    const orderId = crypto.randomUUID();
    
    // Configurar Preferencia de MP
    let initPoint = null;
    let preferenceId = null;

    try {
      const preference = new Preference(mpClient);
      const mpResponse = await preference.create({
        body: {
          items: mpItems,
          back_urls: {
            success: `${(process.env.APP_URL || 'http://localhost:5173').trim()}/orders?payment=success`,
            failure: `${(process.env.APP_URL || 'http://localhost:5173').trim()}/orders?payment=failure`,
            pending: `${(process.env.APP_URL || 'http://localhost:5173').trim()}/orders?payment=pending`,
          },
          external_reference: orderId,
          notification_url: `${(process.env.API_URL || 'https://my-api-domain.com').trim()}/api/checkout/webhook`,
        }
      });
      initPoint = mpResponse.init_point || mpResponse.sandbox_init_point;
      preferenceId = mpResponse.id;
    } catch (mpError) {
      console.error('Error creating MP Preference:', mpError);
      return res.status(400).json({ success: false, message: 'Error en Mercado Pago: ' + (mpError.message || 'Error desconocido') });
    }

    // Guardar orden (los puntos quedan registrados para ser acreditados ÚNICAMENTE cuando el pago se apruebe)
    await db.insert(orders).values({
      id: orderId,
      userId,
      totalAmount,
      status: 'PENDING_PAYMENT',
      paymentStatus: 'PENDING',
      shippingAddress,
      mpPreferenceId: preferenceId,
      pointsAwarded: totalPointsAwarded,
      createdAt: new Date(),
    });

    // Guardar items de la orden
    const itemsToInsert = orderItemsData.map(item => ({ ...item, orderId }));
    await db.insert(orderItems).values(itemsToInsert);

    // Registrar uso del cupón
    if (appliedCouponObj) {
      await db.insert(couponUsages).values({
        id: crypto.randomUUID(),
        couponId: appliedCouponObj.id,
        userId,
        usedAt: new Date()
      });
    }

    // 4. Vaciar carrito
    await db.delete(cartItems).where(eq(cartItems.cartId, userCart[0].id));

    res.json({ success: true, data: { orderId, initPoint } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Función central para acreditar compra y sumar puntos (idempotente)
export async function completeOrderPayment(orderId, paymentId = null) {
  const orderRec = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (orderRec.length === 0) {
    return { success: false, message: 'Orden no encontrada' };
  }

  const order = orderRec[0];

  // Si ya fue aprobada, no volver a sumar puntos ni duplicar operaciones
  if (order.paymentStatus === 'APPROVED') {
    return { success: true, message: 'La orden ya fue aprobada previamente', order };
  }

  // 1. Actualizar estado de la orden a APROBADO
  await db.update(orders).set({
    paymentStatus: 'APPROVED',
    status: 'PROCESSING',
    mpPaymentId: paymentId || order.mpPaymentId || null,
    updatedAt: new Date(),
  }).where(eq(orders.id, orderId));

  // 2. Sumar puntos al usuario ÚNICAMENTE tras compra completada y aprobada
  const pointsToAward = order.pointsAwarded || 0;
  if (pointsToAward > 0) {
    const userRec = await db.select().from(users).where(eq(users.id, order.userId)).limit(1);
    if (userRec.length > 0) {
      const currentPoints = userRec[0].points || 0;
      await db.update(users).set({ points: currentPoints + pointsToAward }).where(eq(users.id, order.userId));
    }
  }

  // 3. Crear notificación interna para el usuario
  try {
    await db.insert(notifications).values({
      id: crypto.randomUUID(),
      userId: order.userId,
      title: '¡Pago Aprobado!',
      message: `Tu pedido #${order.id.slice(0, 8)} ha sido confirmado.${pointsToAward > 0 ? ` ¡Sumaste ${pointsToAward} puntos por tu compra!` : ''}`,
      createdAt: new Date(),
    });
  } catch (err) {
    console.error('Error creando notificación:', err);
  }

  // 4. Descontar stock de los productos comprados
  try {
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
    for (const item of items) {
      const prod = await db.select().from(products).where(eq(products.id, item.productId)).limit(1);
      if (prod.length > 0) {
        const newStock = Math.max(0, prod[0].stock - item.quantity);
        await db.update(products).set({ stock: newStock, updatedAt: new Date() }).where(eq(products.id, item.productId));
      }
    }
  } catch (err) {
    console.error('Error actualizando stock:', err);
  }

  return { success: true, message: 'Pago y puntos acreditados con éxito', pointsAwarded: pointsToAward };
}

// POST /api/checkout/confirm-payment
// Permite confirmar y acreditar la compra al regresar de Mercado Pago con payment=success
router.post('/confirm-payment', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId, paymentId, status } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'orderId es requerido' });
    }

    const orderRec = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (orderRec.length === 0 || orderRec[0].userId !== userId) {
      return res.status(404).json({ success: false, message: 'Orden no encontrada' });
    }

    const order = orderRec[0];

    // Si ya fue aprobada previamente
    if (order.paymentStatus === 'APPROVED') {
      const userRec = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      return res.json({
        success: true,
        message: 'Orden ya confirmada previamente',
        points: userRec[0]?.points || 0,
        pointsAwarded: order.pointsAwarded || 0,
      });
    }

    // Verificar con Mercado Pago si se envió un paymentId válido
    let isApproved = false;
    if (paymentId && paymentId !== 'null' && paymentId !== 'undefined') {
      try {
        const paymentClient = new Payment(mpClient);
        const mpPayment = await paymentClient.get({ id: paymentId });
        if (mpPayment && (mpPayment.status === 'approved' || mpPayment.status_detail === 'accredited')) {
          isApproved = true;
        }
      } catch (mpErr) {
        console.warn('Verificación directa con MP API falló o en modo prueba:', mpErr.message);
      }
    }

    // Si viene aprobado desde MP o con callback status approved
    if (isApproved || status === 'approved') {
      const result = await completeOrderPayment(orderId, paymentId);
      const userRec = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      return res.json({
        success: true,
        message: 'Pago confirmado y puntos acreditados',
        pointsAwarded: result.pointsAwarded || 0,
        points: userRec[0]?.points || 0,
      });
    }

    return res.status(400).json({ success: false, message: 'El pago no se encuentra aprobado' });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ success: false, message: 'Error interno al confirmar pago' });
  }
});

// POST /api/checkout/webhook
router.post('/webhook', async (req, res) => {
  try {
    const { type, data, action } = req.body || {};
    const paymentId = data?.id || req.query?.['data.id'] || req.query?.id;
    const topic = type || action || req.query?.topic;

    if (paymentId && (topic === 'payment' || topic === 'payment.created' || topic === 'payment.updated')) {
      try {
        const paymentClient = new Payment(mpClient);
        const mpPayment = await paymentClient.get({ id: paymentId });

        if (mpPayment && (mpPayment.status === 'approved' || mpPayment.status_detail === 'accredited')) {
          const orderId = mpPayment.external_reference;
          if (orderId) {
            console.log(`Webhook MP: acreditando orden ${orderId} con pago ${paymentId}`);
            await completeOrderPayment(orderId, paymentId);
          }
        }
      } catch (mpErr) {
        console.error('Error procesando pago en webhook MP:', mpErr);
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Error en webhook MP:', error);
    res.status(500).send('Error');
  }
});

export default router;
