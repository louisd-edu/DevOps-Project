<script lang="ts">
    import type { Profile } from '$lib/types/Recipe';
    import { goto } from '$app/navigation';
    import { prepareImageUrls } from '$lib/components/prepareImageUrls';
    import yumlogo from '$lib/assets/yumlogo.png';

    let { profile = null } = $props<{ profile?: Partial<Profile> | null }>();

    let avatarSrc: string | null = $state(null);
    $effect(() => {
        const url = profile?.avatar_url ?? null;
        prepareImageUrls(url, 'avatars').then((result) => {
            avatarSrc = result;
        });
    });

    function goUser() {
        // eslint-disable-next-line svelte/no-navigation-without-resolve
        goto('/user/' + encodeURIComponent(profile?.username ?? ''));
    }
    function goAuth() {
        // eslint-disable-next-line svelte/no-navigation-without-resolve
        goto('/auth');
    }
    function goHome() {
        // eslint-disable-next-line svelte/no-navigation-without-resolve
        goto('/');
    }

    let levelPct: number = $state(0);

    $effect(() => {
        const n = Number(profile?.level ?? 0);
        levelPct = Number.isFinite(n) ? Math.max(0, Math.min(100, Math.round(n % 100))) : 0;
    });

    let level: number = $derived(Math.trunc( Number(profile?.level ?? 0) / 100));

</script>

<nav class="w-full mt-3">
  <div class="flex items-center justify-between bg-[#cdea86] rounded-full md:px-3 px-2 md:pl-0 pl-5 py-2  md:py-3 gap-2">
    <!-- Left spacer (optional actions) -->
    <div class="flex-1 min-w-0"></div>

    <!-- Center logo -->
    <div class="shrink-0 order-first md:order-none flex items-center">
        <button onclick={goHome} class="flex items-center">
      <img src={yumlogo} class="h-8 md:h-10" alt="logo" />
        </button>
    </div>

    <!-- Right profile area -->
    <div class="flex-1 min-w-0 flex items-center justify-end ">
      {#if profile}
          <div class="flex flex-col max-w-[60vw] sm:max-w-[40vw] mr-3 min-w-0">

            <span class="text-base md:text-lg font-bold truncate min-w-0">{profile.username ?? 'User'}</span>
            <div class="flex items-center gap-2 shrink-0">
              <div class="h-2 w-24 md:w-32 rounded-full bg-gray-300 overflow-hidden">
                <div class="h-full bg-gray-600" style={`width: ${levelPct}%`}></div>
              </div>
              <span class="text-xs text-gray-600">{level}</span>
            </div>
          </div>
        {#if avatarSrc}
            <button class="" onclick={goUser}><img src={avatarSrc} alt={profile.username ?? 'avatar'} class="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover" /></button>
        {/if}
      {:else}
        <button type="button" class="text-sm md:text-base text-slate-700 hover:text-slate-900" onclick={goAuth}>Sign in</button>
      {/if}
    </div>
  </div>
</nav>
