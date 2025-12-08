import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { getAccountProfile } from "$lib/server/profileQueries";

export const load: PageServerLoad = async ({
  locals: { supabase, safeGetSession },
}) => {
  const { session } = await safeGetSession();

  if (!session) {
    redirect(303, "/");
  }

  const { data: profile } = await getAccountProfile(supabase, session.user.id);

  return { session, profile };
};

export const actions: Actions = {
  update: async ({ request, locals: { supabase, safeGetSession } }) => {
    const formData = await request.formData();
    const fullName = formData.get("fullName") as string;
    const username = formData.get("username") as string;
    const website = formData.get("website") as string;
    const avatarUrl = formData.get("avatarUrl") as string;
    const showFavoritesPublic = formData.get("showFavoritesPublic") === "on";
    const showSavedPublic = formData.get("showSavedPublic") === "on";

    const { session } = await safeGetSession();

    const { error } = await supabase.from("profiles").upsert({
      id: session?.user.id,
      full_name: fullName,
      username,
      website,
      avatar_url: avatarUrl,
      show_favorites_public: showFavoritesPublic,
      show_saved_public: showSavedPublic,
      updated_at: new Date(),
    });

    if (error) {
      return fail(500, {
        fullName,
        username,
        website,
        avatarUrl,
        showFavoritesPublic,
        showSavedPublic,
      });
    }

    return {
      fullName,
      username,
      website,
      avatarUrl,
      showFavoritesPublic,
      showSavedPublic,
    };
  },
  signout: async ({ locals: { supabase, safeGetSession } }) => {
    const { session } = await safeGetSession();
    if (session) {
      await supabase.auth.signOut();
    }
    // Always redirect to home after attempting sign out
    throw redirect(303, "/");
  },
};
