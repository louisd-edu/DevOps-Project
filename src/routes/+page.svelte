<script>

    import RecipeComponent from "$lib/components/RecipeComponent.svelte";

    let { data } = $props();
  </script>

  <div class="grid xl:grid-cols-3 gap-2 w-fit m-auto ">
      {#each data.recipes as recipe (recipe.id)}
          <RecipeComponent {recipe} />
      {/each}
  </div>


