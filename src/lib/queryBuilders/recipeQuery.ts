import type { SupabaseClient } from "@supabase/supabase-js";

export interface RecipeQueryOptions {
  cuisines?: string[];
  searchText?: string;
  sortBy?: "name" | "time";
  sortDir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
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
  } = options;

  let query = supabase.from("recipes").select(
    `
			id,
			user_id,
			recipename,
			recipeimageurl,
			cuisine,
			cookingtime,
			profiles(id, username, avatar_url)
		`,
    { count: "exact" },
  );

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
