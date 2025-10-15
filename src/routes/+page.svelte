<script lang="ts">
    import RecipeComponent from "$lib/components/RecipeComponent.svelte";
    import { Chip } from "$lib";
    import { onMount, tick } from 'svelte';

    let { data } = $props();

    // Local UI state (Svelte 5 runes)
    let selectedBroaderArea = $state<string | null>(null);
    let selectedCuisine = $state<string | null>(null);
    let searchQuery = $state('');
    let sortBy = $state<'name' | 'time'>('name');
    let sortDir = $state<'asc' | 'desc'>('asc');
    let showAllCuisines = $state(false);

    // Scroller/fade state
    let scroller = $state<HTMLDivElement | null>(null);
    let showLeftFade = $state(false);
    let showRightFade = $state(false);

    function updateFades() {
        if (!scroller) {
            showLeftFade = false;
            showRightFade = false;
            return;
        }
        const { scrollLeft, scrollWidth, clientWidth } = scroller;
        showLeftFade = scrollLeft > 0;
        showRightFade = scrollLeft + clientWidth < scrollWidth - 1;
    }

    onMount(() => {
        updateFades();
        // also update after initial paint
        requestAnimationFrame(updateFades);
    });

    $effect(() => {
        // Re-evaluate fades when chip list composition changes
        sortedBroaderAreas; selectedBroaderArea; showAllCuisines; areaRecipeCounts;
        tick().then(() => updateFades());
    });

    // Server-provided counts per broader area
    const areaRecipeCounts: Record<string, number> = data.broaderAreaCounts ?? {};

    // Derived data
    const allBroaderAreas: string[] = $derived(
        Array.from(
            new Set(
                (data.cuisines ?? []).flatMap((c) => c.broader_areas ?? [])
            )
        )
    );

    // Sort broader areas by recipe amount (desc), then by name (asc)
    const sortedBroaderAreas: string[] = $derived(
        allBroaderAreas.slice().sort((a, b) => {
            const ca = areaRecipeCounts[a] ?? 0;
            const cb = areaRecipeCounts[b] ?? 0;
            if (cb !== ca) return cb - ca;
            return a.localeCompare(b);
        })
    );

    const cuisinesForSelectedArea = $derived(
        (
            selectedBroaderArea
                ? (data.cuisines ?? []).filter((c) => (c.broader_areas ?? []).includes(selectedBroaderArea as string))
                : showAllCuisines
                    ? (data.cuisines ?? [])
                    : []
        ).sort((a, b) => a.name.localeCompare(b.name))
    );

    const allowedCuisineNames = $derived(new Set(cuisinesForSelectedArea.map((c) => c.name)));

    const filteredRecipes = $derived(
        (data.recipes ?? [])
            .filter((r) => {
                // Filter by broader area via allowed cuisines (only when a broader area is selected)
                if (selectedBroaderArea) {
                    if (!r.cuisine) return false;
                    if (!allowedCuisineNames.has(r.cuisine)) return false;
                }
                // Filter by cuisine
                if (selectedCuisine && r.cuisine !== selectedCuisine) return false;
                // Filter by search
                const q = searchQuery.trim().toLowerCase();
                if (!q) return true;
                const fields = [r.recipename ?? '', r.cuisine ?? ''];
                return fields.some((f) => f.toLowerCase().includes(q));
            })
            .slice() // clone before sort
            .sort((a, b) => {
                let cmp = 0;
                if (sortBy === 'name') {
                    cmp = (a.recipename ?? '').localeCompare(b.recipename ?? '');
                } else if (sortBy === 'time') {
                    const ta = a.cookingtime ?? Number.POSITIVE_INFINITY;
                    const tb = b.cookingtime ?? Number.POSITIVE_INFINITY;
                    cmp = ta - tb;
                }
                return sortDir === 'asc' ? cmp : -cmp;
            })
    );

    function toggleBroaderArea(area: string) {
        showAllCuisines = false;
        selectedCuisine = null;
        selectedBroaderArea = selectedBroaderArea === area ? null : area;
    }

    function toggleCuisine(name: string) {
        selectedCuisine = selectedCuisine === name ? null : name;
    }

    function toggleAllAreas() {
        // Toggling All areas only affects cuisine visibility; it doesn't filter recipes
        selectedBroaderArea = null;
        selectedCuisine = null;
        showAllCuisines = !showAllCuisines;
    }

    function clearFilters() {
        selectedBroaderArea = null;
        selectedCuisine = null;
        showAllCuisines = false;
        searchQuery = '';
        sortBy = 'name';
        sortDir = 'asc';
        updateFades();
    }
</script>

<!-- Controls -->
<div class=" mx-auto p-3 space-y-4">
    <div class="flex flex-col gap-2">
        <div class="flex items-center gap-2">
            <input
                placeholder="Search recipes or cuisines..."
                bind:value={searchQuery}
                class="px-3 py-2 rounded border border-slate-300 focus:outline-none focus:ring focus:ring-slate-200 w-full"
            />
            <div class="flex items-center gap-2">
                <select bind:value={sortBy} class="pl-3 pr-8 py-2 rounded border border-slate-300">
                    <option value="name">Name</option>
                    <option value="time">Cooking time</option>
                </select>
                <select bind:value={sortDir} class="pl-3 pr-8 py-2 rounded border border-slate-300">
                    <option value="asc">Asc</option>
                    <option value="desc">Desc</option>
                </select>
                <button class="px-3 py-2 rounded bg-slate-200 hover:bg-slate-300" onclick={clearFilters}>
                    Clear
                </button>
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
                    background={selectedBroaderArea === null ? '#111827' : '#e5e7eb'}
                    color={selectedBroaderArea === null ? '#fff' : '#111827'}
                    ariaLabel="All areas"
                    onclick={toggleAllAreas}
                >All areas</Chip>
                {#each sortedBroaderAreas as area (area)}
                    <Chip
                        background={selectedBroaderArea === area ? '#111827' : '#e5e7eb'}
                        color={selectedBroaderArea === area ? '#fff' : '#111827'}
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
                    background={selectedCuisine === c.name ? '#0f766e' : '#d1fae5'}
                    color={selectedCuisine === c.name ? '#fff' : '#064e3b'}
                    ariaLabel={`Cuisine ${c.name}`}
                    onclick={() => toggleCuisine(c.name)}
                >{c.name}</Chip>
            {/each}
        </div>
        {/if}
    </div>

    <!-- Recipes grid -->
    <div class="grid xl:grid-cols-3 gap-2 w-fit m-auto ">
        {#each filteredRecipes as recipe (recipe.id)}
            <RecipeComponent {recipe} />
        {/each}
        {#if !filteredRecipes.length}
            <p class="text-slate-500 p-4">No recipes match your filters.</p>
        {/if}
    </div>
</div>
