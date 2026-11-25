import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  name: text('name').notNull(),
  phone: text('phone'),
  address: text('address'),
  role: text('role').default('CLIENT'),
  points: integer('points').default(0),
  referralCode: text('referral_code').unique(),
  referredBy: text('referred_by'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  price: real('price').notNull(),
  promotionalPrice: real('promotional_price'),
  stock: integer('stock').notNull().default(0),
  points: integer('points').notNull().default(0),
  sku: text('sku').unique(),
  imageUrl: text('image_url'),
  categoryId: text('category_id').references(() => categories.id),
  views: integer('views').notNull().default(0),
  salesCount: integer('sales_count').notNull().default(0),
  active: integer('active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
});

export const cart = sqliteTable('cart', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
});

export const cartItems = sqliteTable('cart_items', {
  id: text('id').primaryKey(),
  cartId: text('cart_id').notNull().references(() => cart.id),
  productId: text('product_id').notNull().references(() => products.id),
  quantity: integer('quantity').notNull().default(1),
  price: real('price').notNull(),
});

export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  totalAmount: real('total_amount').notNull(),
  status: text('status').notNull().default('PENDING_PAYMENT'),
  paymentStatus: text('payment_status').notNull().default('PENDING'),
  shippingAddress: text('shipping_address').notNull(),
  mpPreferenceId: text('mp_preference_id'),
  mpPaymentId: text('mp_payment_id'),
  pointsAwarded: integer('points_awarded').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
});

export const orderItems = sqliteTable('order_items', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull().references(() => orders.id),
  productId: text('product_id').notNull().references(() => products.id),
  quantity: integer('quantity').notNull(),
  price: real('price').notNull(),
});

export const notifications = sqliteTable('notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  message: text('message').notNull(),
  isRead: integer('is_read', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const banners = sqliteTable('banners', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  subtitle: text('subtitle'),
  buttonText: text('button_text'),
  buttonLink: text('button_link'),
  imageUrl: text('image_url'),
  active: integer('active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const coupons = sqliteTable('coupons', {
  id: text('id').primaryKey(),
  name: text('name').notNull().default(''),
  code: text('code').notNull().unique(),
  discountPercentage: real('discount_percentage'),
  discountAmount: real('discount_amount'),
  active: integer('active', { mode: 'boolean' }).default(true),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  targetUserId: text('target_user_id').references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const couponUsages = sqliteTable('coupon_usages', {
  id: text('id').primaryKey(),
  couponId: text('coupon_id').notNull().references(() => coupons.id),
  userId: text('user_id').notNull().references(() => users.id),
  usedAt: integer('used_at', { mode: 'timestamp' }).notNull(),
});

export const productComments = sqliteTable('product_comments', {
  id: text('id').primaryKey(),
  productId: text('product_id').notNull().references(() => products.id),
  userId: text('user_id').notNull().references(() => users.id),
  text: text('text').notNull(),
  rating: integer('rating'), // 1 to 5
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const loyaltySettings = sqliteTable('loyalty_settings', {
  id: text('id').primaryKey(),
  pointsPerArs: real('points_per_ars').notNull().default(0.1), // e.g. 1 point for every 10 ARS
  minPointsToRedeem: integer('min_points_to_redeem').notNull().default(1000),
  discountPerPoint: real('discount_per_point').notNull().default(1), // e.g. 1 point = 1 ARS discount
  isReferralProgramActive: integer('is_referral_program_active', { mode: 'boolean' }).default(false),
});

export const dailyAnalytics = sqliteTable('daily_analytics', {
  date: text('date').primaryKey(), // 'YYYY-MM-DD'
  visits: integer('visits').notNull().default(0),
  productViews: integer('product_views').notNull().default(0),
  ordersCount: integer('orders_count').notNull().default(0),
  revenue: real('revenue').notNull().default(0),
});
