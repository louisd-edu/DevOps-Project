<script lang="ts">
	import { onMount, setContext } from 'svelte';
	import { useFavoritesAndSaved } from '$lib/useFavoritesAndSaved';
	import type { SupabaseClient } from '@supabase/supabase-js';

	interface Props {
		supabase: SupabaseClient;
		userId: string | null;
		children?: import('svelte').Snippet;
	}

	let { supabase, userId, children }: Props = $props();

	// Initialize reusable favorites/saved manager and provide contexts for children
	const favSaved = useFavoritesAndSaved(supabase);
	setContext('favorites', favSaved.favoritesCtx);
	setContext('saved', favSaved.savedCtx);

	// Initialize on mount and cleanup on destroy
	onMount(() => {
		favSaved.setUserId(userId);
		const unsub = favSaved.syncAuth();
		void favSaved.loadFavorites();
		void favSaved.loadSaved();
		return () => {
			unsub?.();
			favSaved.destroy();
		};
	});
</script>

{@render children?.()}
