<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { invalidate } from '$app/navigation'
 	import { onMount, setContext } from 'svelte'
    import NavProfile from "$lib/components/NavProfile.svelte";
  
	
	let { data, children } = $props()
  	const session = $derived(data.session)
  	const supabase = $derived(data.supabase)
    // Read profile in a type-safe way even if the generated type hasn't picked it up yet
    const profile = $derived(((data as unknown) as { profile?: any }).profile ?? null)

    // Expose supabase and session via context for children
    setContext('supabase', supabase)
    setContext('session', session)

	onMount(() => {
		const { data: sub } = supabase.auth.onAuthStateChange((_, newSession) => {
		if (newSession?.expires_at !== session?.expires_at) {
			invalidate('supabase:auth')
		}
		})

		return () => sub.subscription.unsubscribe()
	})
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<nav>
</nav>
<div class="m-auto md:w-[80vw] w-[95vw] ">
    <NavProfile {profile}></NavProfile>

    {@render children?.()}

</div>
