import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });
import { createClient } from '@libsql/client';
import { hashPassword } from './src/utils/auth.js';

const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function updateDb() {
  console.log('🔄 Actualizando base de datos en Turso...');

  // 1. Eliminar administradores anteriores
  await client.execute("DELETE FROM users WHERE role = 'ADMIN'");
  console.log('🧹 Admins anteriores eliminados');

  // 2. Crear administrador único solicitado
  const passHash = await hashPassword('mendo1234');
  const now = Math.floor(Date.now() / 1000);
  await client.execute({
    sql: "INSERT INTO users (id, name, email, password_hash, role, points, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    args: ['admin-unica-mz', 'ÚNICA Perfumería', 'unica.perfumeria.mz@gmail.com', passHash, 'ADMIN', 0, now]
  });
  console.log('✅ Admin único creado exitosamente: unica.perfumeria.mz@gmail.com / mendo1234');

  // 3. Resetear todas las vistas y ventas a 0
  await client.execute('UPDATE products SET views = 0, sales_count = 0');
  console.log('✅ Todas las vistas y ventas de productos puestas exactamente en 0');

  // 4. Limpiar métricas diarias inventadas
  await client.execute('DELETE FROM daily_analytics');
  console.log('✅ Métricas diarias analíticas limpiadas');

  console.log('✨ Base de datos Turso actualizada perfectamente.');
}

updateDb().then(() => process.exit(0)).catch((err) => {
  console.error('Error actualizando Turso:', err);
  process.exit(1);
});
