<script lang="ts">

    import {goto} from "$app/navigation";
    import { page } from '$app/stores'

    let { data, children } = $props();
    let profile = $derived(data.profile);
    let avatar = $derived(data.avatar);
    let isOwner = $derived(data.isOwner);

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


<div class="mt-5 mb-4 rounded-[136px] max-[540px]:rounded-full bg-neutral-200 dark:bg-neutral-800 relative overflow-hidden shadow-lg">
    <!-- Level progress background fill -->
    <div
        class="absolute inset-0 bg-gradient-to-r from-primary-300/50 to-accent-300/50 dark:from-primary-600/40 dark:to-accent-500/40 rounded-[136px] max-[540px]:rounded-full transition-all duration-500"
        style={`width: ${levelPct}%`}
    ></div>

    <div class="flex-row flex relative top-0 right-0 p-10 max-[540px]:p-4">
        <img src={avatar} alt={profile?.username} class="rounded-full w-48 h-48 max-[540px]:w-16 max-[540px]:h-16 ring-4 ring-white dark:ring-neutral-700 shadow-xl" />
        <div class="flex flex-col justify-center ml-6 max-[540px]:ml-4">
            <!-- Name section - shown inside on larger screens -->
            <div class="max-[540px]:hidden">
                <div class="font-bold text-4xl text-neutral-900 dark:text-neutral-50">{profile?.displayname}</div>
                <div class="text-neutral-700 dark:text-neutral-300 text-lg">@{profile?.username}</div>
            </div>
            <div class="text-sm text-neutral-600 dark:text-neutral-400 mt-2 max-[540px]:mt-0 font-medium">Level {level} • {levelPct}% to next level</div>
            <div class="max-[540px]:hidden">
                <form method="POST" action="/account?/signout">
                    <button type="submit" class="underline text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-50 transition-colors">Log out</button>
                </form>
            </div>
        </div>
    </div>
</div>

<!-- Name section - shown outside on small screens -->
<div class="mb-3 max-[540px]:block hidden">
    <div class="font-bold text-3xl text-neutral-900 dark:text-neutral-50">{profile?.displayname}</div>
    <div class="text-neutral-700 dark:text-neutral-300 text-base">@{profile?.username}</div>
</div>

<!-- Logout button - shown outside on small screens -->
<div class="mb-4 max-[540px]:block hidden">
    <form method="POST" action="/account?/signout">
        <button type="submit" class="underline text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-50 transition-colors">Log out</button>
    </form>
</div>

<!-- Action buttons - shown only for profile owner -->
{#if isOwner}
<div class="mt-5 mb-4 flex gap-3 max-[540px]:flex-col">
    <button
        class="px-6 py-3 rounded-full bg-primary-500 dark:bg-primary-600 text-white font-semibold shadow-md hover:bg-primary-600 dark:hover:bg-primary-700 transition-all hover:shadow-lg ring-2 ring-primary-600 dark:ring-primary-400 flex items-center justify-center gap-2"
        onclick={() => go('/upload')}
    >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        Upload Recipe
    </button>
    <button
        class="px-6 py-3 rounded-full bg-accent-500 dark:bg-accent-600 text-white font-semibold shadow-md hover:bg-accent-600 dark:hover:bg-accent-700 transition-all hover:shadow-lg ring-2 ring-accent-600 dark:ring-accent-400 flex items-center justify-center gap-2"
        onclick={() => go('/account')}
    >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
        Edit Account
    </button>
</div>
{/if}

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
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {@render children?.()}
        </div>
    </div>
</div>
