/**
 * Lists tables, columns and enums in the public schema. Useful for verifying
 * that `prisma db push` produced the expected objects on Supabase.
 *
 * Usage: pnpm exec tsx scripts/list-db.ts
 */
import 'dotenv/config';
import pg from 'pg';

async function main() {
  const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!url) throw new Error('DIRECT_URL or DATABASE_URL must be set.');

  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    const tables = await client.query<{ tablename: string }>(
      "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename",
    );
    const enums = await client.query<{ typname: string }>(
      `SELECT t.typname
         FROM pg_type t
         JOIN pg_namespace n ON n.oid = t.typnamespace
        WHERE t.typtype = 'e' AND n.nspname = 'public'
        ORDER BY t.typname`,
    );

    console.log(`Tables (${tables.rows.length}):`);
    for (const r of tables.rows) console.log(`  - ${r.tablename}`);
    console.log(`\nEnums (${enums.rows.length}):`);
    for (const r of enums.rows) console.log(`  - ${r.typname}`);
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error('Failed:', e);
  process.exit(1);
});
