import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // For Supabase: prefer the direct (non-pooled) URL for migrations because
    // the connection pooler blocks DDL. Falls back to DATABASE_URL otherwise.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  },
});
