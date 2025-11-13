<script lang="ts">
    import RecipeComponent from "$lib/components/RecipeComponent.svelte";
    import { getContext, onMount, setContext } from 'svelte';
    import { supabase as supabaseFallback } from '$lib/supabaseClient';
    import { useFavoritesAndSaved } from '$lib/useFavoritesAndSaved';
    import type { Recipe } from '$lib/types/Recipe';
    import type { SupabaseClient, Session } from '@supabase/supabase-js';
    let { data } = $props<{ data: { likedrecipes: Recipe[] } }>();

    const ctxClient = getContext<SupabaseClient>('supabase');
    const ctxSession = getContext<Session | null>('session');
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

{#each data.likedrecipes as recipe (recipe.id)}
    <RecipeComponent {recipe} />
{/each}