<script lang="ts">
import RecipeComponent from "$lib/components/RecipeComponent.svelte";
import {supabase} from "$lib/supabaseClient";
import { useFavoritesAndSaved } from "$lib/useFavoritesAndSaved";
import {onMount, setContext } from 'svelte';
import type {Recipe} from "$lib/types/Recipe";

let { data } = $props<{ data: { myrecipes: Recipe[] } }>();

// Use Supabase and session from layout context if available


// Initialize favorites/saved manager and expose contexts
const favSaved = useFavoritesAndSaved(supabase);
// Provide contexts so RecipeComponent can read them
setContext('favorites', favSaved.favoritesCtx);
setContext('saved', favSaved.savedCtx);

onMount(() => {
    favSaved.setUserId(data.user?.id ?? null);
    const unsub = favSaved.syncAuth();
    void favSaved.loadFavorites();
    void favSaved.loadSaved();
    return () => { unsub?.(); favSaved.destroy(); };
});
</script>


 {#each data.myrecipes as recipe (recipe.id)}
        <RecipeComponent {recipe} />
 {/each}
