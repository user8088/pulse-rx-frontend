export function bucketUrl(key: string) {
  const base = process.env.NEXT_PUBLIC_BUCKET_URL;
  if (!base) throw new Error("NEXT_PUBLIC_BUCKET_URL is not set");

  const cleanBase = base.replace(/\/+$/, "");
  const cleanKey = String(key ?? "").replace(/^\/+/, "");

  // Encode each segment but preserve "/" separators.
  const encodedKey = cleanKey
    .split("/")
    .filter(Boolean)
    .map(encodeURIComponent)
    .join("/");

  return `${cleanBase}/${encodedKey}`;
}

export function tryBucketUrl(key: string | null | undefined): string | null {
  if (!key) return null;
  const base = process.env.NEXT_PUBLIC_BUCKET_URL;
  if (!base) return null;

  try {
    return bucketUrl(key);
  } catch {
    return null;
  }
}

