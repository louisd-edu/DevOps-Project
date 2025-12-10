<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/yumlogo.svg';
	import { invalidate } from '$app/navigation'
 	import { onMount, setContext } from 'svelte'
    import NavProfile from "$lib/components/NavProfile.svelte";


	let { data, children } = $props()
  	const session = $derived(data.session)
  	const supabase = $derived(data.supabase)
    // Read profile in a type-safe way even if the generated type hasn't picked it up yet
    const profile = $derived(data.profile ?? null)

    // Reactive XP state - initialized from server, updated via realtime
    let userXP = $state(data.userXP ?? { total_xp: 0 });

    // Sync with server data when it changes (e.g., navigation)
    $effect(() => {
        if (data.userXP) {
            userXP = data.userXP;
        }
    });

    // Expose supabase and session via context for children
    // Note: These warnings are expected - we intentionally capture the initial values
    setContext('supabase', supabase)
    setContext('session', session)

	onMount(() => {
		const { data: sub } = supabase.auth.onAuthStateChange((_, newSession) => {
		if (newSession?.expires_at !== session?.expires_at) {
			invalidate('supabase:auth')
		}
		})

        // Subscribe to XP changes for realtime updates
        const userId = session?.user?.id;
        let xpChannel: ReturnType<typeof supabase.channel> | null = null;

        if (userId) {
            xpChannel = supabase
                .channel(`user-xp-${userId}`)
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'user_xp',
                    filter: `user_id=eq.${userId}`
                }, (payload: { new?: { total_xp?: number } }) => {
                    if (payload.new && typeof payload.new.total_xp === 'number') {
                        userXP = { total_xp: payload.new.total_xp };
                    }
                })
                .subscribe();
        }

		return () => {
            sub.subscription.unsubscribe();
            if (xpChannel) {
                supabase.removeChannel(xpChannel);
            }
        }
	})
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
    <title>YUMLOG</title>
</svelte:head>

<nav>
</nav>
<div class="m-auto md:w-[80vw] w-[95vw] ">
    <NavProfile {profile} {userXP}></NavProfile>

    {@render children?.()}

</div>
