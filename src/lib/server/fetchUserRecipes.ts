// filepath: /Users/leonard/Downloads/DevOps-Project/src/lib/server/fetchUserRecipes.ts
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Recipe } from "$lib/types/Recipe";

/**
 * Fetch recipes linked from a user reference table (favorites/saved)
 * by joining the recipes table and returning only the nested recipe objects.
 * @param includePrivate - If false, only returns public recipes (default: true for owner view)
 */
export async function fetchUserRecipesBy(
  table: "favorites" | "saved",
  supabase: SupabaseClient,
  userId: string,
  includePrivate: boolean = true,
): Promise<Recipe[]> {
  let query = supabase
    .from(table)
    .select("id, recipeid, recipe:recipes!inner(*, profiles(*))")
    .eq("userid", userId);

  // Filter by public recipes if requested
  if (!includePrivate) {
    query = query.eq("recipe.is_public", true);
  }

  const { data, error } = await query;

  if (error || !data) return [];

  type JoinedRow = { recipe: Recipe | null };
  const recipes = (data as unknown as JoinedRow[])
    .map((row) => row.recipe)
    .filter((r): r is Recipe => Boolean(r));

  return recipes;
}
