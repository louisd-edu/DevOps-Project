// filepath: /Users/leonard/Downloads/DevOps-Project/src/lib/server/fetchUserRecipes.ts
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Recipe } from "$lib/types/Recipe";

/**
 * Fetch recipes linked from a user reference table (favorites/saved)
 * by joining the recipes table and returning only the nested recipe objects.
 */
export async function fetchUserRecipesBy(
  table: "favorites" | "saved",
  supabase: SupabaseClient,
  userId: string,
): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from(table)
    .select("id, recipeid, recipe:recipes(*, profiles(*))")
    .eq("userid", userId);

  if (error || !data) return [];

  type JoinedRow = { recipe: Recipe | null };
  const recipes = (data as unknown as JoinedRow[])
    .map((row) => row.recipe)
    .filter((r): r is Recipe => Boolean(r));

  return recipes;
}
