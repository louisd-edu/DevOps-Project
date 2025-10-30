<script lang="ts">
import RecipeComponent from "$lib/components/RecipeComponent.svelte";
import { supabase as supabaseFallback } from "$lib/supabaseClient";
import { useFavoritesAndSaved } from "$lib/useFavoritesAndSaved";
import { getContext, onMount, setContext } from 'svelte';
import type {Recipe} from "$lib/types/Recipe";

let { data } = $props<{ data: { myrecipes: Recipe[] } }>();

// Use Supabase and session from layout context if available
const ctxClient = getContext('supabase');
const ctxSession = getContext('session');
const sb = ctxClient ?? supabaseFallback;

// Initialize favorites/saved manager and expose contexts
const favSaved = useFavoritesAndSaved(sb);
// Provide contexts so RecipeComponent can read them
setContext('favorites', favSaved.favoritesCtx);
setContext('saved', favSaved.savedCtx);

onMount(() => {
    favSaved.setUserId(ctxSession?.user?.id ?? null);
    const unsub = favSaved.syncAuth();
    void favSaved.loadFavorites();
    void favSaved.loadSaved();
    return () => { unsub?.(); favSaved.destroy(); };
});
</script>


 {#each data.myrecipes as recipe}
        <RecipeComponent {recipe} />
 {/each}
