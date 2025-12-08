// src/routes/[slug]/+page.server.ts
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, locals }) => {
  const { supabase } = locals;
  const { slug } = params;

  const { data, error } = await supabase
    .from("recipes")
    .select(
      `
      *,
      profiles ( username, avatar_url, level ),
      recipe_ingredients(*, ingredients(*, name, calories, protein) )
    `,
    )
    .eq("id", slug)
    .single();

  if (data) {
    console.log("Fetched recipe data:", data.recipe_ingredients);
  }

  if (error) {
    console.error("Error fetching recipe:", error);
    return { error: error.message };
  }

  // Helper to convert a storage path to a public URL (no-op if already a URL)
  function toPublicUrl(
    path: string | null | undefined,
    bucket: string,
  ): string | null {
    if (!path) return null;
    if (/^https?:\/\//.test(path)) return path;
    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
    return pub?.publicUrl ?? null;
  }

  // Normalize recipe image URL
  const recipeData = data as Record<string, unknown>;
  const recipeImagePath = (recipeData.recipeimageurl ??
    recipeData.recipeImage ??
    null) as string | null;
  const publicRecipeUrl = toPublicUrl(recipeImagePath, "recipeimages");
  recipeData.recipeImageUrl = publicRecipeUrl;

  // Normalize avatar URL on nested profile
  const profiles = recipeData.profiles as Record<string, unknown> | undefined;
  if (profiles?.avatar_url) {
    profiles.avatar_url = toPublicUrl(profiles.avatar_url as string, "avatars");
  }

  return { recipe: data };
};
