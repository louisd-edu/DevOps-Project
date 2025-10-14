// src/routes/+page.server.ts
import { fail } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { supabase } from "$lib/supabaseClient";
import type {Recipe} from "$lib/types/Recipe";




export const load: PageServerLoad = async () => {


  const { data, error } = await supabase.from('recipes').select(
	`
	id,
	user_id,
	recipename,
	recipeimageurl,
	profiles(id,username,avatar_url)

	`
) as { data: Recipe[] | null; error: any };

  if (error) {
    console.error('Error loading recipes:', error.message);
    return { recipes: [] };
  }
	console.log('Loaded recipes:', data);

		// Helper to prepare a public URL for a path stored in a storage bucket.
		// If the value is already an absolute URL, it is returned as-is.
		async function prepareImageUrls(path: string | null | undefined, bucket: string) {
			if (!path) return null
			if (/^https?:\/\//.test(path)) return path

			try {
				const { data: publicData } = await supabase.storage.from(bucket).getPublicUrl(path)
				console.log('Public URL for', path, 'in bucket', bucket, ':', publicData)
				return publicData?.publicUrl ?? null
			} catch (e) {
				console.warn('Error getting public URL for', path, e)
				return null
			}
		}

		console.log(data)
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

		console.log('Recipes with images:', recipesWithImages)
		return {
			recipes: recipesWithImages,
		};
};

export const actions: Actions = {
	default: async (event) => {
		const {
			url,
			request,
			locals: { supabase }
		} = event
		const formData = await request.formData()
		const email = formData.get('email') as string
    const validEmail = /^[\w-\.+]+@([\w-]+\.)+[\w-]{2,8}$/.test(email)
    
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