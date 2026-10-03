import bcrypt from "bcryptjs";
import connectDb from "@/lib/db";
import User from "@/models/User";

/**
 * Creates this template's demo account.
 *
 * The credential is hardcoded here rather than read from the environment: it is
 * part of the template, not per-deployment configuration, and there is nothing to
 * vary between apps. The matching values live in this repo's .env purely so the
 * dashboard has something to read back and show the owner — if you change one,
 * change the other or the panel will advertise a login that does not exist.
 *
 * This file is also where the schema gets built: connecting creates the database,
 * the first write creates the collection, and `User.init()` builds the unique
 * index on email that the schema declares.
 *
 * Idempotent, and deliberately not an upsert: if the email already exists the
 * password is left alone. Someone who changes the demo password from inside the
 * app should not have it silently reset on the next dev-server restart.
 */
const DEMO_EMAIL = "demo@iclouds.co.uk";
const DEMO_PASSWORD = "123456";

// Module-level so a burst of concurrent requests seeds once rather than racing.
// Cleared on failure so a transient Mongo error doesn't disable seeding for the
// lifetime of the process.
let pending: Promise<void> | null = null;

export function ensureDemoUser(): Promise<void> {
  if (!pending) {
    pending = (async () => {
      const email = DEMO_EMAIL.toLowerCase();

      await connectDb();
      await User.init();

      const existing = await User.findOne({ email });
      if (existing) return;

      await User.create({
        email,
        password: await bcrypt.hash(DEMO_PASSWORD, 10),
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