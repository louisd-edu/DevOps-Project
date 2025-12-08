// src/routes/+page.server.ts
import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { supabase } from "$lib/supabaseClient";
import type { Cuisine } from "$lib/types/Cuisine";
import {
  buildRecipeQuery,
  transformRecipeResults,
} from "$lib/queryBuilders/recipeQuery";

export const load: PageServerLoad = async ({ url }) => {
  // Parse query params
  const q = (url.searchParams.get("q") ?? "").trim();
  const area = url.searchParams.get("area");
  const cuisineParam = url.searchParams.get("cuisine");
  const sortByParam =
    (url.searchParams.get("sortBy") as "name" | "time") ?? "name";
  const sortDirParam =
    (url.searchParams.get("sortDir") as "asc" | "desc") ?? "asc";
  const pageParam = Math.max(
    1,
    Number.parseInt(url.searchParams.get("page") ?? "1") || 1,
  );
  const pageSizeParam = Math.min(
    50,
    Math.max(
      1,
      Number.parseInt(url.searchParams.get("pageSize") ?? "12") || 12,
    ),
  );

  // Load cuisines first
  const { data: cuisinesData, error: cuisinesError } = await supabase
    .from("cuisines")
    .select("name, broader_areas")
    .returns<Cuisine[]>();

  if (cuisinesError) {
    console.error("Error loading cuisines:", cuisinesError.message);
  }

  // Build list of broader areas
  const allAreas = Array.from(
    new Set((cuisinesData ?? []).flatMap((c) => c.broader_areas ?? [])),
  );

  // For each broader area, count recipes whose cuisine is in the area's cuisines
  const broaderAreaCountsEntries = await Promise.all(
    allAreas.map(async (a) => {
      const cuisineNames = (cuisinesData ?? [])
        .filter((c) => (c.broader_areas ?? []).includes(a))
        .map((c) => c.name);
      if (cuisineNames.length === 0) return [a, 0] as const;
      const { count } = await supabase
        .from("recipes")
        .select("id", { count: "exact", head: true })
        .in("cuisine", cuisineNames);
      return [a, count ?? 0] as const;
    }),
  );
  const broaderAreaCounts = Object.fromEntries(broaderAreaCountsEntries);

  // Determine cuisines to filter by
  let cuisineFilter: string[] = [];
  if (cuisineParam) {
    cuisineFilter = [cuisineParam];
  } else if (area) {
    cuisineFilter = (cuisinesData ?? [])
      .filter((c) => (c.broader_areas ?? []).includes(area))
      .map((c) => c.name);
  }

  // Build recipes query using shared query builder
  const rq = buildRecipeQuery(supabase, {
    cuisines: cuisineFilter,
    searchText: q,
    sortBy: sortByParam,
    sortDir: sortDirParam,
    page: pageParam,
    pageSize: pageSizeParam,
  });

  const { data, error, count } = await rq;

  if (error) {
    console.error("Error loading recipes:", error.message);
    return {
      recipes: [],
      cuisines: cuisinesData ?? [],
      broaderAreaCounts,
      query: {
        q,
        area,
        cuisine: cuisineParam,
        sortBy: sortByParam,
        sortDir: sortDirParam,
        page: pageParam,
        pageSize: pageSizeParam,
        total: 0,
      },
    };
  }

  return {
    recipes: data ? transformRecipeResults(data) : [],
    cuisines: cuisinesData ?? [],
    broaderAreaCounts,
    query: {
      q,
      area,
      cuisine: cuisineParam,
      sortBy: sortByParam,
      sortDir: sortDirParam,
      page: pageParam,
      pageSize: pageSizeParam,
      total: count ?? 0,
    },
  };
};

export const actions: Actions = {
  default: async (event) => {
    const {
      request,
      locals: { supabase },
    } = event;
    const formData = await request.formData();
    const email = formData.get("email") as string;
    // Basic but robust email check without unnecessary escapes
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

    if (!validEmail) {
      return fail(400, {
        errors: { email: "Please enter a valid email address" },
        email,
      });
    }

    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) {
      return fail(400, {
        success: false,
        email,
        message: `There was an issue, Please contact support.`,
      });
    }

    return {
      success: true,
      message:
        "Please check your email for a magic link to log into the website.",
    };
  },
};
