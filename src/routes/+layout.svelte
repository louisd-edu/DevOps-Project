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

	const logout = async () => {
		const { error } = await supabase.auth.signOut()
		if (error) {
		console.error(error)
		}
  	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<nav>
	{#if session?.user}
		<div>
			{session.user.email}
		</div>
		<button onclick={logout}>Log out</button>
	{:else}
		<a href="/auth">Log In</a>
	{/if}
</nav>
<div class="md:m-auto md:w-[80vw] ">
    {@render children?.()}

</div>
