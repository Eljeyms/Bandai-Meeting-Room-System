/**
 * Seed: BDSS bookings
 *
 * Intentionally seeds NO sample bookings. The two demo meetings that used to
 * be created here ("Weekly sync", "VIP client visit") were removed on request,
 * so a fresh database starts with an empty bookings table and the demo
 * calendar only gains bookings created through the UI/API.
 *
 * The file is kept (instead of deleted) so `npm run db:seed -- --only=bookings`
 * remains a valid, idempotent, no-op target.
 */
export const name = "bookings";

/**
 * @param {import("pg").Client} client
 */
export async function seed(client) {
  const { rows } = await client.query("SELECT count(*)::int AS c FROM bookings");
  const count = rows[0]?.c ?? 0;
  if (count > 0) {
    console.log(`  · bookings: skip (already has ${count} row(s))`);
    return;
  }
  console.log("  · bookings: no sample bookings seeded (removed by request)");
}
