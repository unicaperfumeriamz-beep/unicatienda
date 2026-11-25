import 'dotenv/config';
import { execSync } from 'child_process';

export function runMigrations() {
  console.log('🔄 Ejecutando migraciones de base de datos en Turso / SQLite...');
  try {
    execSync('npx drizzle-kit push', { stdio: 'inherit', cwd: process.cwd() });
    console.log('✅ Migraciones completadas exitosamente.');
  } catch (err) {
    console.error('❌ Error durante migraciones:', err.message);
    throw err;
  }
}

if (process.argv[1] && process.argv[1].endsWith('migrate.js')) {
  try {
    runMigrations();
    process.exit(0);
  } catch {
    process.exit(1);
  }
}
