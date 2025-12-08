import type { PageServerLoad } from "./$types";
import { fetchUserRecipesBy } from "$lib/server/fetchUserRecipes";

export const load: PageServerLoad = async ({ locals, parent }) => {
  const { supabase } = locals;

  const { profile } = await parent();

  if (!profile) {
    return {
      likedrecipes: [],
    };
  }

  const likedrecipes = await fetchUserRecipesBy(
    "favorites",
    supabase,
    profile.id,
  );

  return {
    likedrecipes,
  };
};
