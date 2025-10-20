import type {PageServerLoad} from "./$types";


export const load : PageServerLoad = async ({locals, parent}) => {
    const {supabase} = locals;

    const {profile} = await parent();
    // Fetch favorites joined with recipes, then map to just the recipes array
    const { data: favoritesJoined } = await supabase
        .from('favorites')
        .select('id, recipeid, recipe:recipes(*, profiles(*))')
        .eq('userid', profile.id);

    const likedrecipes = (favoritesJoined ?? [])
        .map((row: any) => row?.recipe)
        .filter(Boolean);


    console.log(likedrecipes)

    return{
        likedrecipes
    }
}
