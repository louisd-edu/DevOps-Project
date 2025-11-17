import type { LayoutServerLoad } from "./$types";
import { prepareImageUrls } from "$lib/components/prepareImageUrls";
import { getProfileByUsername } from "$lib/server/profileQueries";

export const load: LayoutServerLoad = async ({ locals, params }) => {
  const { supabase } = locals;
  const { username } = params;

  const { data: profile, error } = await getProfileByUsername(supabase, username);

  if (error || !profile) {
    return { profile: null };
  }

  const { data: myrecipes } = await supabase
    .from("recipes")
    .select("*")
    .eq("user_id", profile.id);

  const avatar = await prepareImageUrls(profile.avatar_url, "avatars");

  return {
    profile,
    avatar,
    myrecipes: myrecipes ?? [],
  };
};
