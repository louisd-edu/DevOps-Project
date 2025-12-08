<script lang="ts">
  import { Chip } from "$lib";
  import Avatar from "$lib/components/Avatar.svelte";
  import ShareButton from "$lib/components/ShareButton.svelte";
  import { getContext } from 'svelte';
  import { goto } from '$app/navigation';
  import type { Session } from '@supabase/supabase-js';
  import { enhance } from '$app/forms';

  let { data } = $props();

  const recipe = $derived(data.recipe);
  const error = $derived(data.error);
  const ctxSession = getContext<Session | null>('session');

  const isOwner = $derived(ctxSession?.user?.id === recipe?.user_id);

  let deleting = $state(false);
</script>

<div class="mx-auto p-3 max-w-7xl space-y-4">
  {#if error}
    <p class="text-red-500 p-4">Error: {error}</p>
  {:else if recipe}
    <!-- Recipe Header -->
    <div class="bg-white border border-slate-300 rounded-lg p-6 space-y-4">
      <div class="flex flex-col lg:flex-row gap-6">
        <!-- Recipe Image -->
        <div class="lg:w-1/3">
          <img
            src={recipe.recipeImageUrl}
            alt={recipe.recipename}
            class="w-full h-64 lg:h-full object-cover rounded-lg"
          />
        </div>

        <!-- Recipe Info -->
        <div class="lg:w-2/3 space-y-4">
          <div class="flex justify-between items-start">
            <h1 class="font-bold text-3xl lg:text-4xl">{recipe.recipename}</h1>

            <div class="flex gap-2">
              <!-- Share button (always visible) -->
              <ShareButton
                recipeId={recipe.id}
                isPublic={recipe.is_public}
                shareToken={recipe.share_token}
              />

              {#if isOwner}
                <button
                  type="button"
                  onclick={() => goto(`/recipe/${recipe.id}/edit`)}
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit
                </button>
                <form method="POST" action="?/delete" use:enhance={() => {
                  if (!confirm('Are you sure you want to delete this recipe?')) {
                    return async ({ cancel }) => cancel();
                  }
                  deleting = true;
                  return async ({ result }) => {
                    if (result.type === 'redirect') {
                      goto(result.location);
                    }
                    deleting = false;
                  };
                }}>
                  <button
                    type="submit"
                    disabled={deleting}
                    class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                </form>
              {/if}
            </div>
          </div>

          <div class="flex flex-wrap gap-2">
            <Chip background="#0f766e" color="#fff">{recipe.cuisine}</Chip>
            <Chip background="#e5e7eb" color="#111827">{recipe.cookingtime} min</Chip>
          </div>

          <div class="flex items-center gap-3 pt-2">
            <Avatar url={recipe.profiles?.avatar_url} size="h-12 w-12" />
            <div>
              <div class="font-medium text-lg">{recipe.profiles?.username}</div>
              <div class="text-slate-500 text-sm">Recipe Creator</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Ingredients Section -->
    <div class="bg-white border border-slate-300 rounded-lg p-6">
      <h2 class="font-bold text-2xl mb-4">Ingredients</h2>
      <div class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="border-b border-slate-300">
              <th class="text-left px-4 py-3 font-semibold">Quantity</th>
              <th class="text-left px-4 py-3 font-semibold">Ingredient</th>
              <th class="text-left px-4 py-3 font-semibold">Nutrition</th>
            </tr>
          </thead>
          <tbody>
            {#each recipe.recipe_ingredients as recipeIngredient (recipeIngredient.id || recipeIngredient.ingredientid)}
              <tr class="border-b border-slate-200 hover:bg-slate-50">
                <td class="px-4 py-3">
                  {recipeIngredient.quantity || 'N/A'}
                  {#if recipeIngredient.type && recipeIngredient.type.toLowerCase() !== 'none'}
                    {recipeIngredient.type}
                  {/if}
                </td>
                <td class="px-4 py-3">
                  {recipeIngredient.ingredient?.name || recipeIngredient.ingredientid || 'N/A'}
                </td>
                <td class="px-4 py-3 text-slate-600">
                  {recipeIngredient.ingredients?.calories ?? '-'}kcal • {recipeIngredient.ingredients?.protein ?? '-'}g protein
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Method Section -->
    <div class="bg-white border border-slate-300 rounded-lg p-6">
      <h2 class="font-bold text-2xl mb-4">Method</h2>
      {#if recipe.method && recipe.method.length > 0}
        <div class="space-y-4">
          {#each recipe.method as step, index (index)}
            <div class="flex gap-4">
              <div class="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-semibold">
                {index + 1}
              </div>
              <div class="flex-1 pt-1">
                <p class="text-slate-700">{step}</p>
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <p class="text-slate-500 italic">No method steps provided.</p>
      {/if}
    </div>

    <!-- Comments Section -->
    <div class="bg-white border border-slate-300 rounded-lg p-6">
      <h2 class="font-bold text-2xl mb-4">Comments</h2>
      <input
        type="text"
        placeholder="Add a comment..."
        class="w-full px-3 py-2 rounded border border-slate-300 focus:outline-none focus:ring focus:ring-slate-200"
      />
    </div>
  {/if}
</div>