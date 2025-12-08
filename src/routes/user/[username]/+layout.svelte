<script lang="ts">

    import {goto} from "$app/navigation";
    import { page } from '$app/stores'

    let { data, children } = $props();
    let profile = $derived(data.profile);
    let avatar = $derived(data.avatar);

    function go(route: string) {
        // eslint-disable-next-line svelte/no-navigation-without-resolve
        goto(route);
    }

    // Current path and base path for this user's section
    const pathname = $derived($page.url.pathname)
    const base = $derived(`/user/${profile?.username}`)
    const isMy = $derived(pathname === base)
    const isLiked = $derived(pathname.startsWith(`${base}/liked`))
    const isSaved = $derived(pathname.startsWith(`${base}/saved`))

    // Calculate level percentage (progress within current level)
    let levelPct = $derived.by(() => {
        const n = Number(profile?.level ?? 0);
        return Number.isFinite(n) ? Math.max(0, Math.min(100, Math.round(n % 100))) : 0;
    });

    let level = $derived(Math.trunc(Number(profile?.level ?? 0) / 100));

</script>


<div class="mt-5 mb-4 rounded-[136px] bg-neutral-200 dark:bg-neutral-800 relative overflow-hidden shadow-lg">
    <!-- Level progress background fill -->
    <div
        class="absolute inset-0 bg-gradient-to-r from-primary-300/50 to-accent-300/50 dark:from-primary-600/40 dark:to-accent-500/40 rounded-[136px] transition-all duration-500"
        style={`width: ${levelPct}%`}
    ></div>

    <div class="flex-row flex relative top-0 right-0 p-10">
        <img src={avatar} alt={profile?.username} class="rounded-full w-48 h-48 ring-4 ring-white dark:ring-neutral-700 shadow-xl" />
        <div class="flex flex-col justify-center ml-6">
            <div class="font-bold text-4xl text-neutral-900 dark:text-neutral-50">{profile?.displayname}</div>
            <div class="text-neutral-700 dark:text-neutral-300 text-lg">@{profile?.username}</div>
            <div class="text-sm text-neutral-600 dark:text-neutral-400 mt-2 font-medium">Level {level} • {levelPct}% to next level</div>
            <div>
                <form method="POST" action="/account?/signout">
                    <button type="submit" class="underline text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-50 transition-colors">Log out</button>
                </form>
            </div>
        </div>
    </div>
</div>
<div class="mt-5 mb-4 lg:px-10">
    <button
      class={`px-5 py-3 rounded-full transition-all font-medium ${isMy ? 'bg-primary-500 dark:bg-primary-600 text-white shadow-lg ring-2 ring-primary-600 dark:ring-primary-400' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-50 hover:bg-accent-200 dark:hover:bg-accent-800'}`}
      onclick={() => go(`/user/${profile?.username}`)}
    >
      My Recipes
    </button>
    <button
      class={`px-5 py-3 rounded-full transition-all ml-2 font-medium ${isLiked ? 'bg-primary-500 dark:bg-primary-600 text-white shadow-lg ring-2 ring-primary-600 dark:ring-primary-400' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-50 hover:bg-accent-200 dark:hover:bg-accent-800'}`}
      onclick={() => go(`/user/${profile?.username}/liked`)}
    >
      Liked
    </button>
    <button
      class={`px-5 py-3 rounded-full transition-all ml-2 font-medium ${isSaved ? 'bg-primary-500 dark:bg-primary-600 text-white shadow-lg ring-2 ring-primary-600 dark:ring-primary-400' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-50 hover:bg-accent-200 dark:hover:bg-accent-800'}`}
      onclick={() => go(`/user/${profile?.username}/saved`)}
    >
      Saved
    </button>

    <div class="mt-3">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {@render children?.()}
        </div>
    </div>
</div>
