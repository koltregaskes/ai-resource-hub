// This producer always uses TLS and the platform trust store. pg's URL parser
// can replace the explicit ssl object, so remove URL SSL overrides first.
// Do not load certificate/key files supplied through connection-string options.
export function alertConnectionOptions(connectionString) {
  let url;
  try {
    url = new URL(connectionString);
  } catch {
    throw new Error("Invalid database connection URL");
  }
  if (!["postgres:", "postgresql:"].includes(url.protocol)) {
    throw new Error("Invalid database connection URL protocol");
  }
  const overrides = new Set([
    "ssl", "sslmode", "sslcert", "sslkey", "sslrootcert", "uselibpqcompat",
  ]);
  for (const key of [...url.searchParams.keys()]) {
    if (overrides.has(key.toLowerCase())) url.searchParams.delete(key);
  }
  return {
    connectionString: url.toString(),
    ssl: { rejectUnauthorized: true },
  };
}
