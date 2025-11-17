import type { PageServerLoad } from "./$types";
export const load: PageServerLoad = async ({ locals, parent }) => {
  const { supabase } = locals;

  const { profile } = await parent();

  const { data: myrecipes } = await supabase
    .from("recipes")
    .select("*, profiles(*)")
    .eq("user_id", profile.id);

  console.log(myrecipes);

  return {
    myrecipes: myrecipes ?? [],
  };
};
