<script lang="ts">
    import RecipeComponent from "$lib/components/RecipeComponent.svelte";
    import { Chip } from "$lib";
    import { onMount, tick, setContext, getContext, onDestroy } from 'svelte';
    import { supabase as supabaseFallback } from '$lib/supabaseClient';
    import { writable, type Writable } from 'svelte/store';
    import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
    import {prepareImageUrls} from "$lib/components/prepareImageUrls";

    let { data } = $props();

    // Use the Supabase client from layout context if available (shares auth session)
    const ctxClient = getContext<any>('supabase');
    const ctxSession = getContext<any>('session');
    const sb = ctxClient ?? supabaseFallback;

    // UI-only toggle to show all cuisines when "All areas" chip is active
    let showAllCuisines = $state(false);

    // Scroller/fade state
    let scroller = $state<HTMLDivElement | null>(null);
    let showLeftFade = $state(false);
    let showRightFade = $state(false);

    function updateFades() {
        if (!scroller) { showLeftFade = false; showRightFade = false; return; }
        const { scrollLeft, scrollWidth, clientWidth } = scroller;
        showLeftFade = scrollLeft > 0;
        showRightFade = scrollLeft + clientWidth < scrollWidth - 1;
    }

    onMount(() => { updateFades(); requestAnimationFrame(updateFades); });

    $effect(() => { tick().then(() => updateFades()); });

    // Local interactive state (no URL params)
    let currentQ = $state<string>(data.query?.q ?? '');
    let currentArea = $state<string | null>(data.query?.area ?? null);
    let currentCuisine = $state<string | null>(data.query?.cuisine ?? null);
    let currentSortBy = $state<'name' | 'time'>(data.query?.sortBy ?? 'name');
    let currentSortDir = $state<'asc' | 'desc'>(data.query?.sortDir ?? 'asc');
    let currentPage = $state<number>(1);
    let pageSize = $state<number>(12);

    // Results state
    let recipes = $state<any[]>(data.recipes ?? []);
    let total = $state<number>(data.query?.total ?? (data.recipes?.length ?? 0));
    const totalPages = $derived<number>(Math.max(1, Math.ceil(total / pageSize)));

    // Local input model for search box (independent from currentQ)
    let searchInput = $state<string>(data.query?.q ?? '');
    function handleSearchInput(e: Event) {
        const target = e.target as HTMLInputElement | null;
        searchInput = target?.value ?? '';
    }

    // Debounced search: query after 300ms of inactivity
    $effect(() => {
        if (typeof window === 'undefined') return;
        const next = searchInput.trim();
        const cur = currentQ.trim();
        if (next === cur) return; // no change, skip
        if (next.length > 0 && next.length < 2) return; // minimum length guard
        const t = setTimeout(() => {
            currentQ = next;
            currentPage = 1;
        }, 300);
        return () => clearTimeout(t);
    });

    // Server-provided counts per broader area
    const areaRecipeCounts: Record<string, number> = data.broaderAreaCounts ?? {};

    // Broader areas and sorted order by count desc then name asc
    const allBroaderAreas: string[] = $derived(
        Array.from(new Set((data.cuisines ?? []).flatMap((c) => c.broader_areas ?? [])))
    );
    const sortedBroaderAreas: string[] = $derived((() => {
        const arr = allBroaderAreas.slice();
        arr.sort((a, b) => {
            const ca = areaRecipeCounts[a] ?? 0; const cb = areaRecipeCounts[b] ?? 0;
            if (cb !== ca) return cb - ca; return a.localeCompare(b);
        });
        return arr;
    })());

    // Cuisines to display under chips
    const cuisinesForSelectedArea = $derived((() => {
        const list = (
            currentArea
                ? (data.cuisines ?? []).filter((c) => (c.broader_areas ?? []).includes(currentArea as string))
                : showAllCuisines
                    ? (data.cuisines ?? [])
                    : []
        );
        return list.slice().sort((a, b) => a.name.localeCompare(b.name));
    })());


    // Build cuisine list for current area
    function cuisinesForArea(area: string | null): string[] {
        if (!area) return [];
        return (data.cuisines ?? [])
            .filter((c) => (c.broader_areas ?? []).includes(area))
            .map((c) => c.name);
    }

    // Favorites context (store + API)
    const favoriteIdsStore: Writable<Set<string>> = writable(new Set());
    let currentUserId = $state<string | null>(ctxSession?.user?.id ?? null);

    // Saved context (store + API)
    const savedIdsStore: Writable<Set<string>> = writable(new Set());

    // Keep local snapshots to avoid stale reads
    let favSnapshot = $state<Set<string>>(new Set());
    const favUnsub = favoriteIdsStore.subscribe((v) => { favSnapshot = v; });
    let savedSnapshot = $state<Set<string>>(new Set());
    const savedUnsub = savedIdsStore.subscribe((v) => { savedSnapshot = v; });
    onDestroy(() => { favUnsub?.(); savedUnsub?.(); });

    // Keep currentUserId in sync with auth changes
    onMount(() => {
        const { data: sub } = sb.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
            const nextId = session?.user?.id ?? null;
            const changed = nextId !== currentUserId;
            currentUserId = nextId;
            if (changed && currentUserId) {
                void loadFavorites();
                void loadSaved();
            }
        });
        return () => sub?.subscription?.unsubscribe?.();
    });

    setContext('favorites', {
        store: favoriteIdsStore,
        toggleFavorite: async (recipeId: string | number) => {
            if (!currentUserId) {
                const { data: userRes } = await sb.auth.getUser();
                currentUserId = userRes?.user?.id ?? null;
            }
            if (!currentUserId) {
                if (typeof window !== 'undefined') alert('Please sign in to add favorites.');
                console.warn('User not logged in; cannot favorite');
                return;
            }
            const key = String(recipeId);
            const isFav = favSnapshot.has(key);
            if (isFav) {
                const { error } = await sb
                    .from('favorites')
                    .delete()
                    .eq('userid', currentUserId)
                    .eq('recipeid', recipeId);
                if (error) {
                    console.warn('Failed to remove favorite:', error.message);
                    if (typeof window !== 'undefined') alert(`Could not remove favorite: ${error.message}`);
                    return;
                }
                favoriteIdsStore.update((s) => { const n = new Set(s); n.delete(key); return n; });
            } else {
                const { error } = await sb
                    .from('favorites')
                    .insert({ userid: currentUserId, recipeid: recipeId });
                if (error) {
                    console.warn('Failed to add favorite:', error.message);
                    if (typeof window !== 'undefined') alert(`Could not add favorite: ${error.message}`);
                    return;
                }
                favoriteIdsStore.update((s) => { const n = new Set(s); n.add(key); return n; });
            }
        }
    });

    setContext('saved', {
        store: savedIdsStore,
        toggleSaved: async (recipeId: string | number) => {
            if (!currentUserId) {
                const { data: userRes } = await sb.auth.getUser();
                currentUserId = userRes?.user?.id ?? null;
            }
            if (!currentUserId) {
                if (typeof window !== 'undefined') alert('Please sign in to save recipes.');
                console.warn('User not logged in; cannot save');
                return;
            }
            const key = String(recipeId);
            const isSaved = savedSnapshot.has(key);
            if (isSaved) {
                const { error } = await sb
                    .from('saved')
                    .delete()
                    .eq('userid', currentUserId)
                    .eq('recipeid', recipeId);
                if (error) {
                    console.warn('Failed to remove saved:', error.message);
                    if (typeof window !== 'undefined') alert(`Could not remove saved: ${error.message}`);
                    return;
                }
                savedIdsStore.update((s) => { const n = new Set(s); n.delete(key); return n; });
            } else {
                const { error } = await sb
                    .from('saved')
                    .insert({ userid: currentUserId, recipeid: recipeId });
                if (error) {
                    console.warn('Failed to save recipe:', error.message);
                    if (typeof window !== 'undefined') alert(`Could not save recipe: ${error.message}`);
                    return;
                }
                savedIdsStore.update((s) => { const n = new Set(s); n.add(key); return n; });
            }
        }
    });


    async function loadFavorites() {
        const uid = currentUserId ?? (await sb.auth.getUser()).data?.user?.id ?? null;
        currentUserId = uid;
        if (!uid) { favoriteIdsStore.set(new Set()); return; }
        const { data: favs, error } = await sb
            .from('favorites')
            .select('recipeid')
            .eq('userid', uid);
        if (error) { console.warn('Failed to load favorites:', error.message); favoriteIdsStore.set(new Set()); return; }
        favoriteIdsStore.set(new Set((favs ?? []).map((r: { recipeid: string | number }) => String(r.recipeid))));
    }

    async function loadSaved() {
        const uid = currentUserId ?? (await sb.auth.getUser()).data?.user?.id ?? null;
        currentUserId = uid;
        if (!uid) { savedIdsStore.set(new Set()); return; }
        const { data: rows, error } = await sb
            .from('saved')
            .select('recipeid')
            .eq('userid', uid);
        if (error) { console.warn('Failed to load saved:', error.message); savedIdsStore.set(new Set()); return; }
        savedIdsStore.set(new Set((rows ?? []).map((r: { recipeid: string | number }) => String(r.recipeid))));
    }

    // Fetch recipes from Supabase based on current interactive state
    let fetchId = 0;
    async function fetchRecipes() {
        if (typeof window === 'undefined') return; // avoid SSR
        const id = ++fetchId;

        let rq = sb
            .from('recipes')
            .select(
                `
                id,
                user_id,
                recipename,
                recipeimageurl,
                cuisine,
                cookingtime,
                profiles(id,username,avatar_url)
                `,
                { count: 'exact' }
            );

        // Apply cuisine/area filter
        if (currentCuisine) {
            rq = rq.eq('cuisine', currentCuisine);
        } else if (currentArea) {
            const names = cuisinesForArea(currentArea);
            if (names.length) rq = rq.in('cuisine', names);
            else rq = rq.eq('cuisine', '__none__');
        }

        // Full-text search with prefix matching
        const q = currentQ.trim().toLowerCase();
        if (q) {
            const tokens = q.match(/[a-z0-9]+/g) ?? [];
            if (tokens.length) {
                const tsQuery = tokens.map((t) => `${t}:*`).join(' & ');
                rq = rq.filter('search_tsv', 'fts', tsQuery);
            }
        }

        // Sorting
        if (currentSortBy === 'name') {
            rq = rq.order('recipename', { ascending: currentSortDir === 'asc' });
        } else {
            rq = rq.order('cookingtime', { ascending: currentSortDir === 'asc', nullsFirst: false });
        }

        // Pagination
        const from = (currentPage - 1) * pageSize;
        const to = from + pageSize - 1;
        rq = rq.range(from, to);

        const { data: rows, error, count } = await rq;
        if (id !== fetchId) return; // out-of-date response

        if (error) {
            console.error('Error loading recipes (client):', error.message);
            recipes = [];
            total = 0;
            return;
        }

        // Prepare image URLs
        const mapped = await Promise.all(
            (rows ?? []).map(async (r: any) => {
                const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
                const profileAvatar = await prepareImageUrls(profile?.avatar_url, 'avatars');
                const recipeImage = await prepareImageUrls(r.recipeimageurl, 'recipeimages');
                return { ...r, profiles: profile, profileAvatar, recipeImage };
            })
        );
        recipes = mapped;
        total = count ?? 0;
        void loadFavorites();
        void loadSaved();
    }

    // Kick initial client-side fetch to ensure consistency
    onMount(() => { fetchRecipes(); loadFavorites(); loadSaved(); });

    // Refetch when any interactive state changes
    $effect(() => {
        // access dependencies so the effect re-runs
        void currentQ; void currentArea; void currentCuisine; void currentSortBy; void currentSortDir; void currentPage; void pageSize;
        if (typeof window === 'undefined') return;
        fetchRecipes();
    });

    function onSearchSubmit() {
        currentQ = searchInput;
        currentPage = 1;
    }

    function onSortByChange(e: Event) {
        const v = (e.target as HTMLSelectElement).value as 'name'|'time';
        currentPage = 1;
        currentSortBy = v;
    }
    function onSortDirChange(e: Event) {
        const v = (e.target as HTMLSelectElement).value as 'asc'|'desc';
        currentPage = 1;
        currentSortDir = v;
    }

    function gotoPage(n: number) {
        const np = Math.min(totalPages, Math.max(1, n));
        if (np !== currentPage) currentPage = np;
    }

    function toggleBroaderArea(area: string) {
        showAllCuisines = false;
        const nextArea = currentArea === area ? null : area;
        currentArea = nextArea;
        currentCuisine = null;
        currentPage = 1;
    }

    function toggleCuisine(name: string) {
        const next = currentCuisine === name ? null : name;
        currentCuisine = next;
        currentPage = 1;
    }

    function toggleAllAreas() {
        // UI only: does not filter recipes; toggles cuisine visibility
        showAllCuisines = !showAllCuisines;
        // Clear area/cuisine; keep recipes unfiltered by area
        currentArea = null;
        currentCuisine = null;
        currentPage = 1;
    }

    function clearFilters() {
        showAllCuisines = false;
        searchInput = '';
        currentQ = '';
        currentArea = null;
        currentCuisine = null;
        currentSortBy = 'name';
        currentSortDir = 'asc';
        currentPage = 1;
    }

    // Input focus management
    let searchEl = $state<HTMLInputElement | null>(null);
    function focusSearch(toEnd: boolean = false) {
        if (typeof window === 'undefined') return;
        if (!searchEl) return;
        searchEl.focus({ preventScroll: true });
        if (toEnd) {
            try {
                const len = searchEl.value?.length ?? 0;
                searchEl.setSelectionRange(len, len);
            } catch (e) { void e }
        }
    }

    onMount(() => { focusSearch(true); });

    $effect(() => {
        // When query-driven state changes, ensure the search stays focused
        void currentQ; void currentArea; void currentCuisine; void currentSortBy; void currentSortDir; void currentPage;
        tick().then(() => { updateFades(); focusSearch(); });
    });
</script>

<!-- Controls -->
<div class=" mx-auto p-3 space-y-4">
    <div class="flex flex-col gap-2">
        <div class="flex items-center flex-wrap gap-2">
            <input
                placeholder="Search recipes or cuisines..."
                value={searchInput}
                oninput={handleSearchInput}
                onkeydown={(e) => (e.key === 'Enter' || e.key === 'NumpadEnter') && onSearchSubmit()}
                bind:this={searchEl}
                class="px-3 py-2 rounded border border-slate-300 focus:outline-none focus:ring focus:ring-slate-200 w-full"
            />
            <div class="flex items-center gap-2">
                <select value={currentSortBy} onchange={onSortByChange} class="pl-3 pr-8 py-2 rounded border border-slate-300">
                    <option value="name">Name</option>
                    <option value="time">Cooking time</option>
                </select>
                <select value={currentSortDir} onchange={onSortDirChange} class="pl-3 pr-8 py-2 rounded border border-slate-300">
                    <option value="asc">Asc</option>
                    <option value="desc">Desc</option>
                </select>
                <!--button class="px-3 py-2 rounded bg-slate-200 hover:bg-slate-300" onclick={onSearchSubmit}>Search</button-->
                <button class="px-3 py-2 rounded bg-slate-200 hover:bg-slate-300" onclick={clearFilters}>Clear</button>
            </div>
        </div>

        <!-- Broader areas -->
        {#if sortedBroaderAreas.length}
        <div class="relative -mb-2">
            <div
                class="flex overflow-x-auto items-center gap-2 pb-2 pr-6"
                style="scrollbar-gutter: stable both-edges;"
                bind:this={scroller}
                onscroll={updateFades}
            >
                <Chip
                    background={currentArea === null ? '#111827' : '#e5e7eb'}
                    color={currentArea === null ? '#fff' : '#111827'}
                    ariaLabel="All areas"
                    onclick={toggleAllAreas}
                >All areas</Chip>
                {#each sortedBroaderAreas as area (area)}
                    <Chip
                        background={currentArea === area ? '#111827' : '#e5e7eb'}
                        color={currentArea === area ? '#fff' : '#111827'}
                        ariaLabel={`Broader area ${area}`}
                        onclick={() => toggleBroaderArea(area)}
                    >{area} <span class="text-gray-400">{areaRecipeCounts[area] ?? 0}</span></Chip>
                {/each}
            </div>
            {#if showLeftFade}
                <div class="pointer-events-none absolute left-0 top-0 h-full w-10" style="background: linear-gradient(to right, rgba(255,255,255,1), rgba(255,255,255,0));"></div>
            {/if}
            {#if showRightFade}
                <div class="pointer-events-none absolute right-0 top-0 h-full w-10" style="background: linear-gradient(to left, rgba(255,255,255,1), rgba(255,255,255,0));"></div>
            {/if}
        </div>
        {/if}

        <!-- Cuisines for selected broader area (or all if All areas is toggled) -->
        {#if cuisinesForSelectedArea.length}
        <div class="flex flex-wrap items-center gap-2">
            {#each cuisinesForSelectedArea as c (c.name)}
                <Chip
                    background={currentCuisine === c.name ? '#0f766e' : '#d1fae5'}
                    color={currentCuisine === c.name ? '#fff' : '#064e3b'}
                    ariaLabel={`Cuisine ${c.name}`}
                    onclick={() => toggleCuisine(c.name)}
                >{c.name}</Chip>
            {/each}
        </div>
        {/if}
    </div>

    <!-- Recipes grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4 gap-1 mx-auto">
        {#each recipes as recipe (recipe.id)}
            <RecipeComponent {recipe} />
        {/each}
        {#if !recipes.length}
            <p class="text-slate-500 p-4">No recipes match your filters.</p>
        {/if}
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-center gap-2 py-4">
        <button class="px-3 py-2 rounded bg-slate-200 disabled:opacity-50" disabled={currentPage <= 1} onclick={() => gotoPage(currentPage - 1)}>
            Prev
        </button>
        <span class="text-sm text-slate-600">Page {currentPage} of {totalPages} • {total} results</span>
        <button class="px-3 py-2 rounded bg-slate-200 disabled:opacity-50" disabled={currentPage >= totalPages} onclick={() => gotoPage(currentPage + 1)}>
            Next
        </button>
    </div>
</div>
