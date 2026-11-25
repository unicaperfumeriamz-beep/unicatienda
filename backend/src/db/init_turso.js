import 'dotenv/config';
import { createClient } from '@libsql/client';
import { runSeed } from './seed.js';

const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const statements = [
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT,
    name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    role TEXT DEFAULT 'CLIENT',
    points INTEGER DEFAULT 0,
    referral_code TEXT UNIQUE,
    referred_by TEXT,
    created_at INTEGER NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at INTEGER NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    price REAL NOT NULL,
    promotional_price REAL,
    stock INTEGER NOT NULL DEFAULT 0,
    points INTEGER NOT NULL DEFAULT 0,
    sku TEXT UNIQUE,
    image_url TEXT,
    category_id TEXT REFERENCES categories(id),
    views INTEGER NOT NULL DEFAULT 0,
    sales_count INTEGER NOT NULL DEFAULT 0,
    active INTEGER DEFAULT 1,
    created_at INTEGER NOT NULL,
    updated_at INTEGER
  );`,

  `CREATE TABLE IF NOT EXISTS cart (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    created_at INTEGER NOT NULL,
    updated_at INTEGER
  );`,

  `CREATE TABLE IF NOT EXISTS cart_items (
    id TEXT PRIMARY KEY,
    cart_id TEXT NOT NULL REFERENCES cart(id),
    product_id TEXT NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    price REAL NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    total_amount REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING_PAYMENT',
    payment_status TEXT NOT NULL DEFAULT 'PENDING',
    shipping_address TEXT NOT NULL,
    mp_preference_id TEXT,
    mp_payment_id TEXT,
    points_awarded INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER
  );`,

  `CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES orders(id),
    product_id TEXT NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price REAL NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS banners (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    button_text TEXT,
    button_link TEXT,
    image_url TEXT,
    active INTEGER DEFAULT 1,
    created_at INTEGER NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS coupons (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL DEFAULT '',
    code TEXT NOT NULL UNIQUE,
    discount_percentage REAL,
    discount_amount REAL,
    active INTEGER DEFAULT 1,
    expires_at INTEGER,
    target_user_id TEXT REFERENCES users(id),
    created_at INTEGER NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS coupon_usages (
    id TEXT PRIMARY KEY,
    coupon_id TEXT NOT NULL REFERENCES coupons(id),
    user_id TEXT NOT NULL REFERENCES users(id),
    used_at INTEGER NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS product_comments (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id),
    user_id TEXT NOT NULL REFERENCES users(id),
    text TEXT NOT NULL,
    rating INTEGER,
    created_at INTEGER NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS loyalty_settings (
    id TEXT PRIMARY KEY,
    points_per_ars REAL NOT NULL DEFAULT 0.1,
    min_points_to_redeem INTEGER NOT NULL DEFAULT 1000,
    discount_per_point REAL NOT NULL DEFAULT 1,
    is_referral_program_active INTEGER DEFAULT 0
  );`,

  `CREATE TABLE IF NOT EXISTS daily_analytics (
    date TEXT PRIMARY KEY,
    visits INTEGER NOT NULL DEFAULT 0,
    product_views INTEGER NOT NULL DEFAULT 0,
    orders_count INTEGER NOT NULL DEFAULT 0,
    revenue REAL NOT NULL DEFAULT 0
  );`
];

async function initialize() {
  console.log('🚀 Creando tablas en Turso...');
  for (const sql of statements) {
    await client.execute(sql);
  }
  console.log('✅ Tablas creadas exitosamente en Turso.');

  console.log('🌱 Ejecutando seed en la base de datos de Turso...');
  await runSeed();
  console.log('🎉 Base de datos de Turso completamente configurada y cargada con UNICA Perfumería!');
}

initialize().then(() => process.exit(0)).catch((err) => {
  console.error('Error inicializando Turso:', err);
  process.exit(1);
});
