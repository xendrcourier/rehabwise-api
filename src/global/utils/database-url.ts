// `prisma dev` hands out `prisma+postgres://` URLs meant for Prisma's own
// query engine, which knows how to unwrap them. The `pg` driver behind
// @prisma/adapter-pg does not speak that protocol — it needs the real
// `postgres://` URL, which is base64-encoded inside the `api_key` param.
export function resolvePostgresConnectionString(databaseUrl: string): string {
  if (!databaseUrl.startsWith('prisma+postgres://')) {
    return databaseUrl;
  }

  const apiKey = new URL(databaseUrl).searchParams.get('api_key');
  if (!apiKey) {
    throw new Error(
      'DATABASE_URL uses the prisma+postgres:// scheme but is missing an api_key to decode',
    );
  }

  const { databaseUrl: rawUrl } = JSON.parse(
    Buffer.from(apiKey, 'base64').toString('utf8'),
  ) as { databaseUrl: string };

  return rawUrl;
}
