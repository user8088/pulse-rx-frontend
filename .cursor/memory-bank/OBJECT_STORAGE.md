# Frontend (Next.js) — Public Images from Laravel Cloud Object Storage

This project uses **Laravel Cloud Object Storage** (S3-compatible, backed by Cloudflare R2) for image hosting.

Because the bucket is **public**, the frontend should **fetch images directly from the bucket URL** (no Laravel proxy/fetch endpoint needed).

Reference: [Laravel Cloud Object Storage docs](https://cloud.laravel.com/docs/resources/object-storage)

---

## What the backend stores

Store **only the object key/path** in the database (not a full URL).

Example object keys:

- `tenants/123/products/ABC123.png`
- `tenants/123/avatars/user_456.jpg`

This keeps data portable across environments (dev/staging/prod), even if the bucket domain changes.

---

## Next.js environment variable

Set the bucket’s **public base URL** in your Next project:

- `NEXT_PUBLIC_BUCKET_URL`

Example:

```env
NEXT_PUBLIC_BUCKET_URL=https://cdn.yourdomain.com
```

Notes:

- Prefer a **custom domain** (e.g. `cdn.yourdomain.com`) for stability.
- Avoid a trailing slash if possible (the helper below normalizes either way).

---

## Build the image URL from a key

Create a small helper in the Next app:

```ts
// lib/bucketUrl.ts
export function bucketUrl(key: string) {
  const base = process.env.NEXT_PUBLIC_BUCKET_URL;
  if (!base) throw new Error("NEXT_PUBLIC_BUCKET_URL is not set");

  const cleanBase = base.replace(/\/+$/, "");
  const cleanKey = key.replace(/^\/+/, "");

  // Encode each segment, but preserve "/" separators.
  const encodedKey = cleanKey
    .split("/")
    .filter(Boolean)
    .map(encodeURIComponent)
    .join("/");

  return `${cleanBase}/${encodedKey}`;
}
```

Usage with `next/image`:

```tsx
import Image from "next/image";
import { bucketUrl } from "@/lib/bucketUrl";

export function ProductImage({ imageKey }: { imageKey: string }) {
  return (
    <Image
      src={bucketUrl(imageKey)}
      alt="Product image"
      width={800}
      height={800}
    />
  );
}
```

Usage with a plain `<img>` tag:

```tsx
import { bucketUrl } from "@/lib/bucketUrl";

export function Avatar({ imageKey }: { imageKey: string }) {
  return <img src={bucketUrl(imageKey)} alt="Avatar" />;
}
```

---

## Configure `next/image` to allow the bucket host

Next.js blocks remote images unless you explicitly allow the host.

### App Router / Pages Router

In `next.config.js`:

```js
// next.config.js
const bucketUrl = process.env.NEXT_PUBLIC_BUCKET_URL || "";
let bucketHost = "";

try {
  bucketHost = bucketUrl ? new URL(bucketUrl).hostname : "";
} catch {
  bucketHost = "";
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: bucketHost
      ? [
          {
            protocol: "https",
            hostname: bucketHost,
            pathname: "/**",
          },
        ]
      : [],
  },
};

module.exports = nextConfig;
```

If you *know* the host and don’t want the dynamic parsing, hardcode it:

```js
module.exports = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.yourdomain.com", pathname: "/**" },
    ],
  },
};
```

---

## Recommended key naming

Use a consistent, tenant-aware key structure:

- `tenants/{tenant_id}/products/{serial_number}.png`
- `tenants/{tenant_id}/avatars/{user_id}.jpg`

This matches the backend architecture guidance (store only URLs/keys, keep tenant boundaries clear).

---

## When to involve the backend (future)

If you later switch to **private** objects (or need per-tenant access rules), don’t proxy bytes; instead:

- backend returns **temporary signed URLs** (e.g. `Storage::temporaryUrl(...)`)
- frontend uses the signed URL as the image `src`

For a public bucket, direct URLs are the simplest and fastest approach.

