import { supabase } from "$lib/supabaseClient";

/**
 * Normalizes storage path by removing common prefixes
 * @param path - The path to normalize
 * @returns Normalized path without leading slashes or bucket prefixes
 */
function normalizePath(path: string): string {
  let normalized = path.trim();
  if (normalized.startsWith("/")) normalized = normalized.slice(1);
  if (normalized.startsWith("public/"))
    normalized = normalized.slice("public/".length);
  // Remove bucket-specific prefixes (avatars/, recipes/, etc.)
  const bucketPrefixes = ["avatars/", "recipes/"];
  for (const prefix of bucketPrefixes) {
    if (normalized.startsWith(prefix)) {
      normalized = normalized.slice(prefix.length);
      break;
    }
  }
  return normalized;
}

/**
 * Prepares image URLs for display by handling absolute URLs and Supabase storage paths
 * @param path - The image path (can be absolute URL or storage path)
 * @param bucket - The Supabase storage bucket name
 * @returns Public URL for the image or null if unavailable
 */
export async function prepareImageUrls(
  path: string | null | undefined,
  bucket: string,
) {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;

  try {
    const normalized = normalizePath(path);
    const { data: publicData } = await supabase.storage
      .from(bucket)
      .getPublicUrl(normalized);
    return publicData?.publicUrl ?? null;
  } catch (e) {
    void e;
    console.warn("Error getting public URL for", path, e);
    return null;
  }
}
