<script>
    import RecipeComponent from "$lib/components/RecipeComponent.svelte";

    let {data} = $props();
</script>

<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {#each data.likedrecipes as recipe}
        <RecipeComponent {recipe} />
    {/each}
</div>
