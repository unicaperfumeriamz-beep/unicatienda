import { db } from './src/db/index.js';
import { coupons } from './src/db/schema.js';
import crypto from 'crypto';

async function test() {
  try {
    const id = crypto.randomUUID();
    const code = "NAVIDAD15";
    const discountPercentage = 15;
    
    await db.insert(coupons).values({ 
      id, 
      code: code.toUpperCase(), 
      discountPercentage: parseFloat(discountPercentage), 
      createdAt: new Date() 
    });
    console.log('Inserted coupon');
  } catch (err) {
    console.error('Error creating coupon:', err.message);
  }
}
test();
