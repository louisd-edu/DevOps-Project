<script lang="ts">
  import { Chip } from "$lib";
  import Avatar from "$lib/components/Avatar.svelte";
  export let data;

  const { recipe, error } = data;
</script>

{#if error}
  <p class="text-red-500">Error: {error}</p>
{:else if recipe}
  <div class="bg-gray-200 p-2 rounded-[56px]">
    <div class="flex flex-row items-start space-x-4">
      <img
        src={recipe.recipeImageUrl}
        alt="recipeimage"
        class="w-1/4 h-1/4 object-cover rounded-[48px]"
      />
      <div class="flex flex-col space-y-2 flex-1 pt-1 pl-5">
        <div class="font-bold text-5xl text-nowrap">{recipe.recipename}</div>
        <div class="text-gray-600 flex space-x-2 pt-2">
          <Chip>{recipe.cuisine}</Chip>
          <Chip>{recipe.cookingtime}min</Chip>

        </div>
        <div class="flex items-center space-x-2 leading-tight pt-3">
          <Avatar url={recipe.profiles?.avatar_url} size="h-14 w-14" />
          <div>
            <div class="font-medium">{recipe.profiles?.username}</div>
            <div class="text-gray-500">Beginner Cook</div>
          </div>
        </div>
      </div>
      <div class="pt-1 flex items-center flex-col">
        <div class="font-bold text-xl mb-2">Ingredients:</div>
        <table
          class="min-w-full border-collapse border border-gray-300 rounded-[48px] overflow-hidden"
        >
          <thead>
            <tr class="bg-gray-100">
              <th class="border border-gray-300 px-4 py-2 text-left"
                >Quantity</th
              >
              <th class="border border-gray-300 px-4 py-2 text-left"
                >Ingredient</th
              >
              <th class="border border-gray-300 px-4 py-2 text-left"
                >Nutrition</th
              >
            </tr>
          </thead>
          <tbody>
            {#each recipe.recipe_ingredients as recipeIngredient}
              <tr class="bg-[#e0e0e0]">
                <td class="border border-gray-300 px-4 py-2">
                  {recipeIngredient.quantity || 'N/A'} 
                  {#if recipeIngredient.type && recipeIngredient.type.toLowerCase() !== 'none'}
                    {recipeIngredient.type}
                  {/if}
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  {recipeIngredient.ingredient?.name || recipeIngredient.ingredientid || 'N/A'}
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  {recipeIngredient.ingredients?.calories ?? ' '}kcal - {recipeIngredient.ingredients?.protein ?? ''}g protein
                </td>
              </tr>
            {/each}
          </tbody>
          <tfoot>
            <tr class="bg-gray-100">
              <th class="border border-gray-300 px-4 py-2 text-left"
                >&#8192;</th
              >
              <th class="border border-gray-300 px-4 py-2 text-left"
                >&#8192;</th
              >
              <th class="border border-gray-300 px-4 py-2 text-left"
                >&#8192;</th
              >
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <div class="flex flex-row justify-center items-center pt-5 pb-5">
      <div class="mt-4 w-full text-center">
        <div class="font-bold text-xl">Method:</div>
        {#if recipe.method && recipe.method.length > 0}
          {#each recipe.method as step, index}
            <div class="mt-2">
              <div class="font-semibold">Step {index + 1}:</div>
              <div>{step}</div>
            </div>
          {/each}
        {:else}
          <div class="text-gray-600 italic mt-2">No method steps provided.</div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<!-- todo: implement comments section -->
<div class="bg-gray-200 p-2 rounded-[56px] mt-5">
  <div class="font-bold text-xl mb-2">Comments:</div>
  <input type="text" placeholder="Add a comment..." class="w-full p-2 rounded-[32px] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
  <div class=""></div>
</div>