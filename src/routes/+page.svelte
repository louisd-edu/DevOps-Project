<script lang="ts">
    import RecipeComponent from "$lib/components/RecipeComponent.svelte";
    import { Chip } from "$lib";
    import { onMount, tick } from 'svelte';
    import { goto } from '$app/navigation';

    let { data } = $props();

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

    // Current query state from server
    const currentQ = $derived<string>(data.query?.q ?? '');
    const currentArea = $derived<string | null>(data.query?.area ?? null);
    const currentCuisine = $derived<string | null>(data.query?.cuisine ?? null);
    const currentSortBy = $derived<'name' | 'time'>(data.query?.sortBy ?? 'name');
    const currentSortDir = $derived<'asc' | 'desc'>(data.query?.sortDir ?? 'asc');
    const currentPage = $derived<number>(data.query?.page ?? 1);
    const pageSize = $derived<number>(data.query?.pageSize ?? 12);
    const total = $derived<number>(data.query?.total ?? 0);
    const totalPages = $derived<number>(Math.max(1, Math.ceil(total / pageSize)));

    // Local input model for search box, synced from currentQ
    let searchInput = $state(currentQ);
    $effect(() => { searchInput = currentQ; });

    // Debounced search: query after 300ms of inactivity
    $effect(() => {
        if (typeof window === 'undefined') return;
        const next = searchInput.trim();
        const cur = currentQ.trim();
        if (next === cur) return; // no change, skip
        // Only query if empty (clear) or length >= 2
        if (next.length > 0 && next.length < 2) return;
        const t = setTimeout(() => {
            updateQuery({ q: next, page: 1 });
        }, 200);
        return () => clearTimeout(t);
    });

    // Server-provided counts per broader area
    const areaRecipeCounts: Record<string, number> = data.broaderAreaCounts ?? {};

    // Broader areas and sorted order by count desc then name asc
    const allBroaderAreas: string[] = $derived(
        Array.from(new Set((data.cuisines ?? []).flatMap((c) => c.broader_areas ?? [])))
    );
    const sortedBroaderAreas: string[] = $derived(
        allBroaderAreas.slice().sort((a, b) => {
            const ca = areaRecipeCounts[a] ?? 0; const cb = areaRecipeCounts[b] ?? 0;
            if (cb !== ca) return cb - ca; return a.localeCompare(b);
        })
    );

    // Cuisines to display under chips
    const cuisinesForSelectedArea = $derived(
        (
            currentArea
                ? (data.cuisines ?? []).filter((c) => (c.broader_areas ?? []).includes(currentArea as string))
                : showAllCuisines
                    ? (data.cuisines ?? [])
                    : []
        ).sort((a, b) => a.name.localeCompare(b.name))
    );

    function updateQuery(updates: Partial<{ q: string; area: string | null; cuisine: string | null; sortBy: 'name'|'time'; sortDir: 'asc'|'desc'; page: number; pageSize: number; }>) {
        const params = new URLSearchParams();
        if (data.query?.q) params.set('q', data.query.q);
        if (data.query?.area) params.set('area', data.query.area);
        if (data.query?.cuisine) params.set('cuisine', data.query.cuisine);
        params.set('sortBy', data.query?.sortBy ?? 'name');
        params.set('sortDir', data.query?.sortDir ?? 'asc');
        params.set('page', String(data.query?.page ?? 1));
        params.set('pageSize', String(data.query?.pageSize ?? 12));
        // apply updates
        if (updates.q !== undefined) {
            const v = updates.q.trim(); if (v) params.set('q', v); else params.delete('q');
        }
        if (updates.area !== undefined) {
            if (updates.area) params.set('area', updates.area); else params.delete('area');
        }
        if (updates.cuisine !== undefined) {
            if (updates.cuisine) params.set('cuisine', updates.cuisine); else params.delete('cuisine');
        }
        if (updates.sortBy) params.set('sortBy', updates.sortBy);
        if (updates.sortDir) params.set('sortDir', updates.sortDir);
        if (updates.page !== undefined) params.set('page', String(updates.page));
        if (updates.pageSize !== undefined) params.set('pageSize', String(updates.pageSize));
        // navigate
        goto(`?${params.toString()}`, { invalidateAll: true });
    }

    function onSearchSubmit() {
        updateQuery({ q: searchInput, page: 1 });
    }

    function onSortByChange(e: Event) {
        const v = (e.target as HTMLSelectElement).value as 'name'|'time';
        updateQuery({ sortBy: v, page: 1 });
    }
    function onSortDirChange(e: Event) {
        const v = (e.target as HTMLSelectElement).value as 'asc'|'desc';
        updateQuery({ sortDir: v, page: 1 });
    }

    function gotoPage(n: number) {
        const np = Math.min(totalPages, Math.max(1, n));
        if (np !== currentPage) updateQuery({ page: np });
    }

    function toggleBroaderArea(area: string) {
        showAllCuisines = false;
        const nextArea = currentArea === area ? null : area;
        updateQuery({ area: nextArea, cuisine: null, page: 1 });
    }

    function toggleCuisine(name: string) {
        const next = currentCuisine === name ? null : name;
        updateQuery({ cuisine: next, page: 1 });
    }

    function toggleAllAreas() {
        // UI only: does not filter recipes; toggles cuisine visibility
        showAllCuisines = !showAllCuisines;
        // Also clear area/cuisine filters if desired; keeping recipes unfiltered by area
        updateQuery({ area: null, cuisine: null, page: 1 });
    }

    function clearFilters() {
        showAllCuisines = false;
        searchInput = '';
        updateQuery({ q: '', area: null, cuisine: null, sortBy: 'name', sortDir: 'asc', page: 1 });
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
            } catch {}
        }
    }

    onMount(() => { focusSearch(true); });

    $effect(() => {
        // When query-driven state changes, ensure the search stays focused
        (() => {/* track deps */})(currentQ, currentArea, currentCuisine, currentSortBy, currentSortDir, currentPage);
        tick().then(() => { updateFades(); focusSearch(); });
    });
</script>

<!-- Controls -->
<div class=" mx-auto p-3 space-y-4">
    <div class="flex flex-col gap-2">
        <div class="flex items-center gap-2">
            <input
                placeholder="Search recipes or cuisines..."
                value={searchInput}
                oninput={(e) => searchInput = (e.target as HTMLInputElement).value}
                onkeydown={(e) => (e.key === 'Enter' || e.key === 'NumpadEnter') && onSearchSubmit()}
                bind:this={searchEl}
                autofocus
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
                <button class="px-3 py-2 rounded bg-slate-200 hover:bg-slate-300" onclick={onSearchSubmit}>Search</button>
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
    <div class="grid xl:grid-cols-3 gap-2 w-fit m-auto ">
        {#each data.recipes as recipe (recipe.id)}
            <RecipeComponent {recipe} />
        {/each}
        {#if !(data.recipes && data.recipes.length)}
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
