import { db } from './src/db/index.js';
import { coupons } from './src/db/schema.js';

async function test() {
  try {
    const res = await db.select().from(coupons);
    console.log('Coupons:', res);
  } catch (err) {
    console.error('Error fetching coupons:', err.message);
  }
}
test();
