<script lang="ts">
    import RecipeComponent from "$lib/components/RecipeComponent.svelte";
    import RecipeInteractionProvider from "$lib/components/RecipeInteractionProvider.svelte";
    import { getContext } from 'svelte';
    import { supabase as supabaseFallback } from '$lib/supabaseClient';
    import type { Recipe } from '$lib/types/Recipe';
    import type { SupabaseClient, Session } from '@supabase/supabase-js';

    let { data } = $props<{ data: { likedrecipes: Recipe[], isOwner: boolean, isPrivate: boolean } }>();

    const ctxClient = getContext<SupabaseClient>('supabase');
    const ctxSession = getContext<Session | null>('session');
    const sb = ctxClient ?? supabaseFallback;
</script>

{#if data.isPrivate && !data.isOwner}
	<div class="privacy-message">
		<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
			<path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
		</svg>
		<h3>This list is private</h3>
		<p>The owner has chosen to keep their liked recipes private.</p>
	</div>
{:else if data.likedrecipes.length === 0}
	<div class="empty-message">
		<p>No liked recipes yet.</p>
	</div>
{:else}
	<RecipeInteractionProvider supabase={sb} userId={ctxSession?.user?.id ?? null}>
		{#each data.likedrecipes as recipe (recipe.id)}
			<RecipeComponent {recipe} />
		{/each}
	</RecipeInteractionProvider>
{/if}

<style>
	.privacy-message {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 4rem 2rem;
		text-align: center;
		color: #6b7280;
	}

	.privacy-message svg {
		margin-bottom: 1rem;
		color: #9ca3af;
	}

	.privacy-message h3 {
		font-size: 1.5rem;
		font-weight: 600;
		color: #374151;
		margin-bottom: 0.5rem;
	}

	.privacy-message p {
		font-size: 1rem;
		color: #6b7280;
	}

	.empty-message {
		padding: 2rem;
		text-align: center;
		color: #6b7280;
	}
</style>