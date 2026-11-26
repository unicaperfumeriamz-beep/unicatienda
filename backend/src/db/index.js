import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();
if (fs.existsSync(path.join(process.cwd(), 'backend/.env'))) {
  dotenv.config({ path: path.join(process.cwd(), 'backend/.env') });
}

export const client = createClient({
  url: process.env.DATABASE_URL || 'file:local.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
