import type { PageServerLoad } from "./$types";
import { fetchUserRecipesBy } from "$lib/server/fetchUserRecipes";

export const load: PageServerLoad = async ({ locals, parent }) => {
  const { supabase } = locals;

  const { profile } = await parent();

  if (!profile) {
    return {
      savedrecipes: [],
    };
  }

  const savedrecipes = await fetchUserRecipesBy("saved", supabase, profile.id);

  return {
    savedrecipes,
  };
};
