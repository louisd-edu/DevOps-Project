import type { PageServerLoad } from "./$types";
import { fetchUserRecipesBy } from "$lib/server/fetchUserRecipes";

export const load: PageServerLoad = async ({ locals, parent }) => {
  const { supabase, safeGetSession } = locals;
  const { session } = await safeGetSession();

  const { profile } = await parent();

  if (!profile) {
    return {
      likedrecipes: [],
      isOwner: false,
      isPrivate: false,
    };
  }

  const isOwner = session?.user?.id === profile.id;
  // Default to public (true) if null/undefined for backwards compatibility
  const isPublic = profile.show_favorites_public ?? true;
  const isPrivate = !isPublic;

  // Only show recipes if viewer is owner or if list is public
  if (!isOwner && isPrivate) {
    return {
      likedrecipes: [],
      isOwner,
      isPrivate,
    };
  }

  const likedrecipes = await fetchUserRecipesBy(
    "favorites",
    supabase,
    profile.id,
  );

  return {
    likedrecipes,
    isOwner,
    isPrivate,
  };
};
