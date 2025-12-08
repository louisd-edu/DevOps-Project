import type { PageServerLoad } from "./$types";
export const load: PageServerLoad = async ({ locals, parent }) => {
  const { supabase, safeGetSession } = locals;
  const { session } = await safeGetSession();

  const { profile } = await parent();

  // Check if viewer is the profile owner
  const isOwner = session?.user?.id === profile.id;

  // Build query with privacy filtering
  let query = supabase
    .from("recipes")
    .select("*, profiles(*)")
    .eq("user_id", profile.id);

  // If not owner, only show public recipes
  if (!isOwner) {
    query = query.eq("is_public", true);
  }

  const { data: myrecipes } = await query;

  console.log(myrecipes);

  return {
    myrecipes: myrecipes ?? [],
    isOwner, // Pass to frontend for badge display
  };
};
