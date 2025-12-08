import type { LayoutServerLoad } from "./$types";
import { getBasicProfile } from "$lib/server/profileQueries";

export const load: LayoutServerLoad = async ({ locals, cookies }) => {
  const { session, user } = await locals.safeGetSession();

  let profile: {
    id: string;
    username: string | null;
    avatar_url: string | null;
  } | null = null;
  if (user) {
    const { data, error } = await getBasicProfile(locals.supabase, user.id);
    if (!error) profile = data;
  }

  return {
    profile,
    session,
    user,
    cookies: cookies.getAll(),
  };
};
