import { supabase } from "$lib/supabaseClient";

export async function prepareImageUrls(
  path: string | null | undefined,
  bucket: string,
) {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  try {
    const { data: publicData } = await supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    return publicData?.publicUrl ?? null;
  } catch (e) {
    void e;
    console.warn("Error getting public URL for", path, e);
    return null;
  }
}
