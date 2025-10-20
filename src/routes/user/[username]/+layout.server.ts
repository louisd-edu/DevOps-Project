import type {LayoutServerLoad} from "./$types";
import {prepareImageUrls} from "$lib/components/prepareImageUrls";

export const load : LayoutServerLoad = async ({locals, params}) => {
    const {supabase} = locals;
    const {username} = params;

    const {data: profile, error} = await supabase
        .from('profiles')
        .select("*")
        .eq('username', username)
        .single();

    if (error || !profile) {
        return { profile: null };
    }

    const {data: myrecipes} = await supabase
        .from('recipes')
        .select('*')
        .eq('user_id', profile.id);


    // Fetch favorites joined with recipes, then map to just the recipes array
    const { data: savedJoined } = await supabase
        .from('saved')
        .select('id, recipeid, recipe:recipes(*)')
        .eq('userid', profile.id);

    const saveddrecipes = (savedJoined ?? [])
        .map((row: any) => row?.recipe)
        .filter(Boolean);


    const avatar = await prepareImageUrls(profile.avatar_url, "avatars");

    return {
        profile,
        avatar,
        myrecipes: myrecipes ?? [],

    };
};
