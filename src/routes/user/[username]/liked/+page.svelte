<script lang="ts">
    import RecipeComponent from "$lib/components/RecipeComponent.svelte";
    import { getContext, onMount, setContext } from 'svelte';
    import { supabase as supabaseFallback } from '$lib/supabaseClient';
    import { useFavoritesAndSaved } from '$lib/useFavoritesAndSaved';

    let { data } = $props<{ data: { likedrecipes: any[] } }>();

    // Use Supabase and session from layout context if available
    const ctxClient = getContext<any>('supabase');
    const ctxSession = getContext<any>('session');
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

<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {#each data.likedrecipes as recipe}
        <RecipeComponent {recipe} />
    {/each}
</div>
