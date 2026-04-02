/**
 * Postgres connection pool for the AI Resource Hub.
 * Replaces SQLite for both build-time reads and scraper writes.
 *
 * Uses the shared atos_db database — same as all other sites.
 * Tables are prefixed with hub_ to avoid collisions.
 */
import pg from 'pg';

const DATABASE_URL = process.env.DATABASE_URL
  || 'postgresql://atos_admin:atos_password@127.0.0.1:5432/atos_db';

let _pool: pg.Pool | null = null;

export function getPool(): pg.Pool {
  if (_pool) return _pool;
  _pool = new pg.Pool({
    connectionString: DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
  return _pool;
}

export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<pg.QueryResult<T>> {
  return getPool().query<T>(text, params);
}

export async function closePool(): Promise<void> {
  if (_pool) {
    await _pool.end();
    _pool = null;
  }
}
