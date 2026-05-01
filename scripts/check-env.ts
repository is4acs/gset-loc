/**
 * Smoke-tests the local .env against the actual Supabase, Stripe and Postgres
 * services. Prints PASS/FAIL per check without ever logging secrets.
 *
 * Usage: pnpm check:env
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import pg from 'pg';

type CheckResult = { name: string; ok: boolean; detail?: string };

const results: CheckResult[] = [];

function record(name: string, ok: boolean, detail?: string) {
  results.push({ name, ok, detail });
}

function safeHost(connectionString: string): string {
  try {
    const u = new URL(connectionString);
    return `${u.hostname}:${u.port || '5432'}/${u.pathname.slice(1) || '?'}`;
  } catch {
    return '?';
  }
}

function presence(name: string, value: string | undefined, expectedPrefix?: string): boolean {
  if (!value || value.includes('YOUR_PROJECT') || value === '' || value === 'sk_test_...') {
    record(name, false, value ? 'still placeholder' : 'missing');
    return false;
  }
  if (expectedPrefix && !value.startsWith(expectedPrefix)) {
    record(name, false, `unexpected format (expected to start with "${expectedPrefix}")`);
    return false;
  }
  record(name, true, `set (${value.length} chars)`);
  return true;
}

async function checkSupabaseAuth(url: string, anonKey: string) {
  try {
    const client = createClient(url, anonKey);
    const { error } = await client.auth.getSession();
    if (error) {
      record('Supabase Auth API', false, error.message);
      return;
    }
    record('Supabase Auth API', true, 'reachable');
  } catch (e) {
    record('Supabase Auth API', false, (e as Error).message);
  }
}

async function checkSupabaseAdmin(url: string, serviceKey: string) {
  try {
    const client = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { error } = await client.auth.admin.listUsers({ page: 1, perPage: 1 });
    if (error) {
      record('Supabase service-role key', false, error.message);
      return;
    }
    record('Supabase service-role key', true, 'admin endpoint reachable');
  } catch (e) {
    record('Supabase service-role key', false, (e as Error).message);
  }
}

async function checkStripe(secretKey: string) {
  try {
    const stripe = new Stripe(secretKey);
    const balance = await stripe.balance.retrieve();
    const liveMode = secretKey.startsWith('sk_live_');
    record(
      'Stripe API',
      true,
      `${liveMode ? '⚠ LIVE' : 'test'} mode, balance currency = ${balance.available[0]?.currency ?? 'n/a'}`,
    );
  } catch (e) {
    record('Stripe API', false, (e as Error).message);
  }
}

async function checkPostgres(name: string, url: string) {
  const host = safeHost(url);
  const client = new pg.Client({ connectionString: url });
  try {
    await client.connect();
    const res = await client.query<{ now: Date }>('SELECT NOW() AS now');
    record(name, true, `${host} — server now=${res.rows[0]?.now.toISOString() ?? 'n/a'}`);
  } catch (e) {
    const err = e as Error & { code?: string };
    const code = err.code ? `[${err.code}] ` : '';
    record(name, false, `${host} — ${code}${err.message.split('\n')[0]}`);
  } finally {
    try {
      await client.end();
    } catch {
      // ignore
    }
  }
}

async function main() {
  console.log('=== GSET Location — env smoke test ===\n');

  const ok = {
    dbUrl: presence('DATABASE_URL', process.env.DATABASE_URL, 'postgres'),
    directUrl: presence('DIRECT_URL', process.env.DIRECT_URL, 'postgres'),
    supaUrl: presence('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL, 'https://'),
    supaAnon: presence('NEXT_PUBLIC_SUPABASE_ANON_KEY', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    supaService: presence('SUPABASE_SERVICE_ROLE_KEY', process.env.SUPABASE_SERVICE_ROLE_KEY),
    stripeSk: presence('STRIPE_SECRET_KEY', process.env.STRIPE_SECRET_KEY, 'sk_'),
    stripePk: presence(
      'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      'pk_',
    ),
  };

  if (ok.directUrl) await checkPostgres('Postgres (DIRECT_URL)', process.env.DIRECT_URL!);
  if (ok.dbUrl) await checkPostgres('Postgres (DATABASE_URL)', process.env.DATABASE_URL!);

  if (ok.supaUrl && ok.supaAnon) {
    await checkSupabaseAuth(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }
  if (ok.supaUrl && ok.supaService) {
    await checkSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }
  if (ok.stripeSk) {
    await checkStripe(process.env.STRIPE_SECRET_KEY!);
  }

  console.log('Results:\n');
  for (const r of results) {
    const icon = r.ok ? '✓' : '✗';
    console.log(`  ${icon} ${r.name}${r.detail ? ` — ${r.detail}` : ''}`);
  }

  const failures = results.filter((r) => !r.ok).length;
  console.log(`\n${failures === 0 ? '✓ All checks passed.' : `✗ ${failures} check(s) failed.`}\n`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error('Unexpected error:', e);
  process.exit(1);
});
