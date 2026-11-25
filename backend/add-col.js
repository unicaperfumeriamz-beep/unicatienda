import { createClient } from '@libsql/client';

const client = createClient({ url: 'file:local.db' });

async function addCol() {
  try {
    await client.execute("ALTER TABLE products ADD COLUMN points INTEGER NOT NULL DEFAULT 0");
    console.log('Added points to products');
  } catch (e) {
    console.error('Error adding column:', e.message);
  }
}

addCol();
