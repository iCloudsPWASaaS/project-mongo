import bcrypt from "bcryptjs";
import connectDb from "@/lib/db";
import User from "@/models/User";

/**
 * Creates this repo's demo account.
 *
 * The credential lives in this repo's own env file (see .env.example) — the
 * platform neither supplies nor stores it. So this file is also where the schema
 * gets built: connecting creates the database, the first write creates the
 * collection, and `User.init()` builds the unique index on email that the schema
 * declares.
 *
 * Idempotent, and deliberately not an upsert: if the email already exists the
 * password is left alone. Someone who changes the demo password from inside the
 * app should not have it silently reset on the next dev-server restart. The
 * trade-off is that editing DEMO_ADMIN_PASSWORD does not change the account in a
 * database that was already seeded.
 */

// Module-level so a burst of concurrent requests seeds once rather than racing.
// Cleared on failure so a transient Mongo error doesn't disable seeding for the
// lifetime of the process.
let pending: Promise<void> | null = null;

export function ensureDemoUser(): Promise<void> {
  if (!pending) {
    pending = (async () => {
      const email = process.env.DEMO_ADMIN_EMAIL?.trim().toLowerCase();
      const password = process.env.DEMO_ADMIN_PASSWORD;
      // Blank values mean someone cleared them to disable the demo account.
      // Signup still works.
      if (!email || !password) return;

      await connectDb();
      await User.init();

      const existing = await User.findOne({ email });
      if (existing) return;

      await User.create({
        email,
        password: await bcrypt.hash(password, 10),
        firstName: "Admin",
        lastName: "User",
        role: "admin",
      });
      console.log(`demo account ready: ${email}`);
    })().catch((err) => {
      console.error("demo account setup failed", err);
      pending = null;
    });
  }
  return pending;
}