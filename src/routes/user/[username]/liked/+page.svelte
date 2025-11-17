<script lang="ts">
    import RecipeComponent from "$lib/components/RecipeComponent.svelte";
    import RecipeInteractionProvider from "$lib/components/RecipeInteractionProvider.svelte";
    import { getContext } from 'svelte';
    import { supabase as supabaseFallback } from '$lib/supabaseClient';
    import type { Recipe } from '$lib/types/Recipe';
    import type { SupabaseClient, Session } from '@supabase/supabase-js';

    let { data } = $props<{ data: { likedrecipes: Recipe[] } }>();

    const ctxClient = getContext<SupabaseClient>('supabase');
    const ctxSession = getContext<Session | null>('session');
    const sb = ctxClient ?? supabaseFallback;
</script>

<RecipeInteractionProvider supabase={sb} userId={ctxSession?.user?.id ?? null}>
	{#each data.likedrecipes as recipe (recipe.id)}
		<RecipeComponent {recipe} />
	{/each}
</RecipeInteractionProvider>