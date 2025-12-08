// src/routes/[slug]/+page.server.ts
import type { Actions, PageServerLoad } from "./$types";
import { fail, redirect } from "@sveltejs/kit";

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

export const actions: Actions = {
  delete: async ({ params, locals }) => {
    const { supabase, safeGetSession } = locals;
    const { session } = await safeGetSession();
    const { slug } = params;

    if (!session) {
      return fail(401, { message: "Unauthorized" });
    }

    // Verify ownership
    const { data: recipe } = await supabase
      .from("recipes")
      .select("user_id")
      .eq("id", slug)
      .single();

    if (!recipe || recipe.user_id !== session.user.id) {
      return fail(403, { message: "Forbidden - You don't own this recipe" });
    }

    // Get user's username from profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", session.user.id)
      .single();

    // Delete the recipe (this will cascade to recipe_ingredients due to foreign key)
    const { error } = await supabase
      .from("recipes")
      .delete()
      .eq("id", slug);

    if (error) {
      console.error("Error deleting recipe:", error);
      return fail(500, { message: "Failed to delete recipe" });
    }

    // Redirect to user's profile (or home if username not found)
    const redirectUrl = profile?.username ? `/user/${profile.username}` : '/';
    throw redirect(303, redirectUrl);
  },
};
