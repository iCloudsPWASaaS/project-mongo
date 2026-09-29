import { S3Client } from "@aws-sdk/client-s3";

// Cloudflare R2 (S3-compatible) — used for file/storage uploads.
// Credentials come from .env.
export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export const R2_BUCKET = process.env.R2_BUCKET || "app";

// Public URL base for accessing uploaded files.
// Format: https://pub-<hash>.r2.dev/<bucket>/<key>
// or custom domain: https://assets.yourdomain.com/<bucket>/<key>
export const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || process.env.R2_PUBLIC_URL || "";

// Helper: get public URL for a file key
export function getR2PublicUrl(key: string): string {
  return `${R2_PUBLIC_URL}/${R2_BUCKET}/${key}`;
}
