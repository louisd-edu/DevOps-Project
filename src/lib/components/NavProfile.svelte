<script lang="ts">
    import type { Profile } from '$lib/types/Recipe';
    import { goto } from '$app/navigation';
    import { prepareImageUrls } from '$lib/components/prepareImageUrls';
    import { getXPProgress } from '$lib/xpHelpers';
    import yumlogo from '$lib/assets/yumlogo.png';

    let { profile = null, userXP = null } = $props<{
        profile?: Partial<Profile> | null;
        userXP?: { total_xp: number } | null;
    }>();

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

    // Calculate level from XP
    const xpProgress = $derived(getXPProgress(userXP?.total_xp ?? 0));
    let levelPct = $derived(xpProgress.progressPercent);
    let level = $derived(xpProgress.currentLevel);

</script>

<nav class="w-full mt-3">
  <div class="flex items-center justify-between bg-accent-300 dark:bg-accent-400 rounded-full md:px-3 px-2 md:pl-0 pl-5 py-2 md:py-3 gap-2 transition-colors">
    <!-- Left spacer (optional actions) -->
    <div class="flex-1 min-w-0"></div>

    <!-- Center logo -->
    <div class="shrink-0 order-first md:order-none flex items-center">
        <button onclick={goHome} class="flex items-center transition-transform hover:scale-105">
      <img src={yumlogo} class="h-8 md:h-10" alt="logo" />
        </button>
    </div>

    <!-- Right profile area -->
    <div class="flex-1 min-w-0 flex items-center justify-end ">
      {#if profile}
          <div class="flex flex-col max-w-[60vw] sm:max-w-[40vw] mr-3 min-w-0">

            <span class="text-base md:text-lg font-bold truncate min-w-0 text-neutral-900 dark:text-neutral-900">{profile.username ?? 'User'}</span>
            <div class="flex items-center gap-2 shrink-0">
              <div class="h-2 w-24 md:w-32 rounded-full bg-neutral-900/20 dark:bg-neutral-900/30 overflow-hidden">
                <div class="h-full bg-primary-600 dark:bg-primary-500 transition-all" style={`width: ${levelPct}%`}></div>
              </div>
              <span class="text-xs text-neutral-900/70 dark:text-neutral-900/80 font-medium">{level}</span>
            </div>
          </div>
        {#if avatarSrc}
            <button class="transition-transform hover:scale-105" onclick={goUser}>
              <img src={avatarSrc} alt={profile.username ?? 'avatar'} class="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover ring-2 ring-neutral-900/10" />
            </button>
        {/if}
      {:else}
        <button type="button" class="text-sm md:text-base text-neutral-900 hover:text-neutral-950 dark:text-neutral-900 dark:hover:text-neutral-950 font-medium transition-colors" onclick={goAuth}>Sign in</button>
      {/if}
    </div>
  </div>
</nav>
