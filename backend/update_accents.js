import { client } from './src/db/index.js';

async function main() {
  console.log('🔄 Actualizando textos en Turso DB para remover tilde de UNICA...');
  await client.execute("UPDATE users SET name = 'UNICA Perfumería' WHERE email = 'unica.perfumeria.mz@gmail.com'");
  await client.execute("UPDATE banners SET title = REPLACE(REPLACE(title, 'ÚNICA', 'UNICA'), 'Única', 'Unica'), subtitle = REPLACE(REPLACE(subtitle, 'ÚNICA', 'UNICA'), 'Única', 'Unica')");
  await client.execute("UPDATE products SET name = REPLACE(REPLACE(name, 'ÚNICA', 'UNICA'), 'Única', 'Unica'), description = REPLACE(REPLACE(description, 'ÚNICA', 'UNICA'), 'Única', 'Unica')");
  console.log('✅ Base de datos Turso actualizada: UNICA sin tildes en usuarios, banners y productos.');
}

main().catch(console.error);
