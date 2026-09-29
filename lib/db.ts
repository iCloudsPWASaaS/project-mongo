import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not set in .env");
}

// Caches the connection across API route invocations / HMR so each serverless
// invocation doesn't spin up a fresh connection pool.
// eslint-disable-next-line no-var
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache:
    | { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
    | undefined;
}

let cached = globalThis.mongooseCache ?? { conn: null, promise: null };
globalThis.mongooseCache = cached;

async function connectDb(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    // If MONGODB_DB is set but URI has no db name, append it
    let uri = MONGODB_URI;
    if (MONGODB_DB && !uri.includes("/?") && !uri.endsWith("/")) {
      // URI already has db name from seedEnv, but if not, use MONGODB_DB
      const hasDbName = /\/\/[^/]+\/[^?#]+/.test(uri) && !uri.endsWith("/");
      if (!hasDbName) {
        uri = `${uri}/${MONGODB_DB}`;
      }
    }
    cached.promise = mongoose.connect(uri).then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDb;
