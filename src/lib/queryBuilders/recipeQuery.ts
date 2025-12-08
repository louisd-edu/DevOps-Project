import type { SupabaseClient } from "@supabase/supabase-js";
import type { Recipe } from "$lib/types/Recipe";

export interface RecipeQueryOptions {
  cuisines?: string[];
  searchText?: string;
  sortBy?: "name" | "time";
  sortDir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
  includePrivate?: boolean;
}

/**
 * Transforms raw query results to include profileAvatar field
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function transformRecipeResults(data: any[]): Recipe[] {
  return data.map((item) => ({
    ...item,
    profileAvatar: item.profiles?.avatar_url ?? null,
  })) as Recipe[];
}

/**
 * Builds a consistent recipe query for both client and server-side use
 * @param supabase - Supabase client instance
 * @param options - Query options for filtering, sorting, and pagination
 * @returns Configured Supabase query
 */
export function buildRecipeQuery(
  supabase: SupabaseClient,
  options: RecipeQueryOptions,
) {
  const {
    cuisines = [],
    searchText = "",
    sortBy = "name",
    sortDir = "asc",
    page = 1,
    pageSize = 12,
    includePrivate = false,
  } = options;

  let query = supabase.from("recipes").select(
    `
			id,
			user_id,
			recipename,
			recipeimageurl,
			cuisine,
			cookingtime,
			is_public,
			share_token,
			profiles!inner(id, username, avatar_url, displayname, level)
		`,
    { count: "exact" },
  );

  // Filter by privacy (exclude private recipes by default)
  if (!includePrivate) {
    query = query.eq("is_public", true);
  }

  // Apply cuisine filter (expects exact cuisine names)
  if (cuisines.length > 0) {
    query = query.in("cuisine", cuisines);
  }

  // Apply full-text search with prefix matching using to_tsquery syntax
  if (searchText.trim()) {
    const tokens = searchText.toLowerCase().match(/[a-z0-9]+/g) ?? [];
    if (tokens.length > 0) {
      const tsQuery = tokens.map((t) => `${t}:*`).join(" & ");
      query = query.textSearch("search_tsv", tsQuery);
    }
  }

  // Apply sorting
  if (sortBy === "name") {
    query = query.order("recipename", { ascending: sortDir === "asc" });
  } else {
    query = query.order("cookingtime", {
      ascending: sortDir === "asc",
      nullsFirst: false,
    });
  }

  // Apply pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  return query;
}
