import type { PageServerLoad } from "./$types";
import { fetchUserRecipesBy } from "$lib/server/fetchUserRecipes";

export const load: PageServerLoad = async ({ locals, parent }) => {
  const { supabase } = locals;

  const { profile } = await parent();

  const savedrecipes = await fetchUserRecipesBy("saved", supabase, profile.id);

  return {
    savedrecipes,
  };
};
