import type { LayoutServerLoad } from "./$types";
import { getBasicProfile } from "$lib/server/profileQueries";

export const load: LayoutServerLoad = async ({ locals, cookies }) => {
  const { session, user } = await locals.safeGetSession();

  let profile: {
    id: string;
    username: string | null;
    avatar_url: string | null;
    level: number | null;
  } | null = null;
  let userXP: { total_xp: number } | null = null;

  if (user) {
    const { data, error } = await getBasicProfile(locals.supabase, user.id);
    if (!error) profile = data;

    // Fetch XP for navbar progress bar
    const { data: xpData } = await locals.supabase
      .from("user_xp")
      .select("total_xp")
      .eq("user_id", user.id)
      .single();
    userXP = xpData ?? { total_xp: 0 };
  }

  return {
    profile,
    userXP,
    session,
    user,
    cookies: cookies.getAll(),
  };
};
