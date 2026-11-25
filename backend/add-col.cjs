import { Database } from 'sqlite3';

const db = new Database('./sqlite.db');

db.serialize(() => {
  db.run("ALTER TABLE coupons ADD COLUMN discount_amount REAL", (err) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log('Column discount_amount added successfully.');
    }
  });
});

db.close();
