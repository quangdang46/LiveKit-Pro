import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
console.log(' database url ' + process.env.DATABASE_URL);
export default defineConfig({
  out: './src/database',
  schema: './src/modules/script/schema/script.entity.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
