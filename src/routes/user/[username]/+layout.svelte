<script lang="ts">

    import type {Profile} from "$lib/types/Profile";
    import {goto} from "$app/navigation";
    import { page } from '$app/stores'

    let { data, children } = $props();
    let profile : Profile = data.profile;

    function go(route: string) {
        // eslint-disable-next-line svelte/no-navigation-without-resolve
        goto(route);
    }

    // Current path and base path for this user's section
    const pathname = $derived($page.url.pathname)
    const base = $derived(`/user/${profile.username}`)
    const isMy = $derived(pathname === base)
    const isLiked = $derived(pathname.startsWith(`${base}/liked`))
    const isSaved = $derived(pathname.startsWith(`${base}/saved`))

</script>


<div class=" mt-5 mb-4 rounded-[136px] bg-gray-100  relative">
    <div class="flex-row flex relative top-0 right-0 p-10">
        <img src={data?.avatar} alt={data?.avatar} class="rounded-full w-48 h-48" />
        <div class="flex flex-col justify-center ml-6">

            <div class="font-bold text-4xl">{profile.displayname}</div>
            <div>@{profile.username}</div>
        </div>
    </div>

</div>
<div class="mt-5 mb-4 px-[136px]">
    <button
      class={`p-3 rounded-full transition-colors ${isMy ? 'bg-green-300 text-white' : 'bg-gray-50 hover:bg-green-100'}`}
      onclick={() => go(`/user/${profile.username}`)}
    >
      MyRecipes
    </button>
    <button
      class={`p-3 rounded-full transition-colors ml-2 ${isLiked ? 'bg-green-300 text-white' : 'bg-gray-50 hover:bg-green-100'}`}
      onclick={() => go(`/user/${profile.username}/liked`)}
    >
      Liked
    </button>
    <button
      class={`p-3 rounded-full transition-colors ml-2 ${isSaved ? 'bg-green-300 text-white' : 'bg-gray-50 hover:bg-green-100'}`}
      onclick={() => go(`/user/${profile.username}/saved`)}
    >
      Saved
    </button>

    <div class="mt-3">
        {@render children?.()}
    </div>
</div>
