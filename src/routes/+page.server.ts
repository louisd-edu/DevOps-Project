// src/routes/+page.server.ts
import { fail } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { supabase } from "$lib/supabaseClient";
import type {Recipe} from "$lib/types/Recipe";
import type { Cuisine } from '$lib/types/Cuisine';

export const load: PageServerLoad = async () => {
  // Defaults (do not read from URL)
  const q = '';
  const area: string | null = null;
  const cuisineParam: string | null = null;
  const sortByParam: 'name' | 'time' = 'name';
  const sortDirParam: 'asc' | 'desc' = 'asc';
  const pageParam = 1;
  const pageSizeParam = 12;

  // Load cuisines first
  const { data: cuisinesData, error: cuisinesError } = await supabase
    .from('cuisines')
    .select('name, broader_areas')
    .returns<Cuisine[]>();

  if (cuisinesError) {
    console.error('Error loading cuisines:', cuisinesError.message);
  }

  // Build list of broader areas
  const allAreas = Array.from(new Set((cuisinesData ?? []).flatMap((c) => c.broader_areas ?? [])));

  // For each broader area, count recipes whose cuisine is in the area's cuisines
  const broaderAreaCountsEntries = await Promise.all(
    allAreas.map(async (a) => {
      const cuisineNames = (cuisinesData ?? [])
        .filter((c) => (c.broader_areas ?? []).includes(a))
        .map((c) => c.name);
      if (cuisineNames.length === 0) return [a, 0] as const;
      const { count } = await supabase
        .from('recipes')
        .select('id', { count: 'exact', head: true })
        .in('cuisine', cuisineNames);
      return [a, count ?? 0] as const;
    })
  );
  const broaderAreaCounts = Object.fromEntries(broaderAreaCountsEntries);

  // Build initial recipes query with default sort/pagination
  let rq = supabase
    .from('recipes')
    .select(
      `
      id,
      user_id,
      recipename,
      recipeimageurl,
      cuisine,
      cookingtime,
      profiles(id,username,avatar_url)
      `,
      { count: 'exact' }
    );

  if (sortByParam === 'name') {
    rq = rq.order('recipename', { ascending: sortDirParam === 'asc' });
  } else {
    rq = rq.order('cookingtime', { ascending: sortDirParam === 'asc', nullsFirst: false });
  }

  const from = (pageParam - 1) * pageSizeParam;
  const to = from + pageSizeParam - 1;
  rq = rq.range(from, to);

  const { data, error, count } = await rq;

  if (error) {
    console.error('Error loading recipes:', error.message);
    return {
      recipes: [],
      cuisines: cuisinesData ?? [],
      broaderAreaCounts,
      query: { q, area, cuisine: cuisineParam, sortBy: sortByParam, sortDir: sortDirParam, page: pageParam, pageSize: pageSizeParam, total: 0 }
    };
  }

  // Prepare public image URLs
  async function prepareImageUrls(path: string | null | undefined, bucket: string) {
    if (!path) return null
    if (/^https?:\/\//.test(path)) return path
    try {
      const { data: publicData } = await supabase.storage.from(bucket).getPublicUrl(path)
      return publicData?.publicUrl ?? null
    } catch (e) {
      console.warn('Error getting public URL for', path, e)
      return null
    }
  }

  const recipesWithImages = await Promise.all(
    (data ?? []).map(async (r) => {
      const profileAvatar = await prepareImageUrls(r.profiles?.avatar_url, 'avatars')
      const recipeImage = await prepareImageUrls(r.recipeimageurl, 'recipeimages')
      return { ...r, profileAvatar, recipeImage }
    })
  )

  return {
    recipes: recipesWithImages,
    cuisines: cuisinesData ?? [],
    broaderAreaCounts,
    query: { q, area, cuisine: cuisineParam, sortBy: sortByParam, sortDir: sortDirParam, page: pageParam, pageSize: pageSizeParam, total: count ?? 0 }
  };
};

export const actions: Actions = {
	default: async (event) => {
		const {
			request,
			locals: { supabase }
		} = event
		const formData = await request.formData()
		const email = formData.get('email') as string
    // Basic but robust email check without unnecessary escapes
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)

		if (!validEmail) {
			return fail(400, { errors: { email: "Please enter a valid email address" }, email })
		}

		const { error } = await supabase.auth.signInWithOtp({ email })

		if (error) {
			return fail(400, {
				success: false,
				email,
				message: `There was an issue, Please contact support.`
			})
		}

		return {
			success: true,
			message: 'Please check your email for a magic link to log into the website.'
		}
	}
}