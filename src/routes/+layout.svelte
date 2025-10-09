<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { invalidate } from '$app/navigation'
 	import { onMount } from 'svelte'
	

	let { data, children } = $props()
  	let { session, supabase } = $derived(data)

	onMount(() => {
		const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
		if (newSession?.expires_at !== session?.expires_at) {
			invalidate('supabase:auth')
		}
		})

		return () => data.subscription.unsubscribe()
	})
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<nav>
	{#if session?.user}
		<div>Log OUT</div>
	{:else}
		<div>Log IN</div>
	{/if}
</nav>
{@render children?.()}

