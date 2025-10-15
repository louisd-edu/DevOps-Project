// src/routes/+page.server.ts
import { fail } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { supabase } from "$lib/supabaseClient";
import type {Recipe} from "$lib/types/Recipe";
import type { Cuisine } from '$lib/types/Cuisine';

export const load: PageServerLoad = async () => {
  const { data, error } = await supabase
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
		`
    )
    .returns<Recipe[]>();

  if (error) {
    console.error('Error loading recipes:', error.message);
    return { recipes: [], cuisines: [], broaderAreaCounts: {} };
  }

  const { data: cuisinesData, error: cuisinesError } = await supabase
    .from('cuisines')
    .select('name, broader_areas')
    .returns<Cuisine[]>();

  if (cuisinesError) {
    console.error('Error loading cuisines:', cuisinesError.message);
  }

  // Build list of broader areas from cuisines
  const allAreas = Array.from(
    new Set((cuisinesData ?? []).flatMap((c) => c.broader_areas ?? []))
  );

  // For each broader area, count recipes whose cuisine is in the area's cuisines
  const broaderAreaCountsEntries = await Promise.all(
    allAreas.map(async (area) => {
      const cuisineNames = (cuisinesData ?? [])
        .filter((c) => (c.broader_areas ?? []).includes(area))
        .map((c) => c.name);

      if (cuisineNames.length === 0) return [area, 0] as const;

      const { count, error: countError } = await supabase
        .from('recipes')
        .select('id', { count: 'exact', head: true })
        .in('cuisine', cuisineNames);

      if (countError) {
        console.error(`Error counting recipes for area ${area}:`, countError.message);
      }

      return [area, count ?? 0] as const;
    })
  );

  const broaderAreaCounts = Object.fromEntries(broaderAreaCountsEntries);

	// Helper to prepare a public URL for a path stored in a storage bucket.
	// If the value is already an absolute URL, it is returned as-is.
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

			return {
				...r,
				profileAvatar,
				recipeImage,
			}
		})
	)

	return {
		recipes: recipesWithImages,
    cuisines: cuisinesData ?? [],
    broaderAreaCounts,
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