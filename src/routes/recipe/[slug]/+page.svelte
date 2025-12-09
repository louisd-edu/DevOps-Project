<script lang="ts">
  import { Chip } from "$lib";
  import Avatar from "$lib/components/Avatar.svelte";
  import ShareButton from "$lib/components/ShareButton.svelte";
  import CommentSection from "$lib/components/comments/CommentSection.svelte";
  import Icon from '@iconify/svelte';
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
    <p class="text-red-500 dark:text-red-400 p-4">Error: {error}</p>
  {:else if recipe}
    <!-- Recipe Header -->
    <div class="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-6 space-y-4 shadow-lg">
      <div class="flex flex-col lg:flex-row gap-6">
        <!-- Recipe Image -->
        <div class="lg:w-1/3">
          <img
            src={recipe.recipeImageUrl}
            alt={recipe.recipename}
            class="w-full h-64 lg:h-full object-cover rounded-lg ring-2 ring-neutral-300 dark:ring-neutral-600"
          />
        </div>

        <!-- Recipe Info -->
        <div class="lg:w-2/3 space-y-4">
          <div class="flex justify-between items-start gap-3">
            <h1 class="font-bold text-2xl sm:text-3xl lg:text-4xl flex-1 min-w-0 text-neutral-900 dark:text-neutral-50">{recipe.recipename}</h1>

            <div class="flex gap-2 flex-shrink-0">
              <!-- Share button (always visible on mobile as icon-only) -->
              <ShareButton
                recipeId={recipe.id}
                isPublic={recipe.is_public}
                shareToken={recipe.share_token}
              />

              {#if isOwner}
                <button
                  type="button"
                  onclick={() => {
                    // eslint-disable-next-line svelte/no-navigation-without-resolve
                    goto(`/recipe/${recipe.id}/edit`);
                  }}
                  class="flex items-center justify-center gap-2 px-3 py-2 min-w-[44px] h-[44px] bg-primary-500 dark:bg-primary-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:bg-primary-600 dark:hover:bg-primary-700 active:scale-95"
                  title="Edit this recipe"
                >
                  <Icon icon="mdi:pencil" height="20" />
                  <span class="hidden sm:inline whitespace-nowrap">Edit</span>
                </button>
                <form method="POST" action="?/delete" class="contents" use:enhance={() => {
                  if (!confirm('Are you sure you want to delete this recipe?')) {
                    return async () => {};
                  }
                  deleting = true;
                  return async ({ result }) => {
                    if (result.type === 'redirect') {
                      // eslint-disable-next-line svelte/no-navigation-without-resolve
                      goto(result.location);
                    }
                    deleting = false;
                  };
                }}>
                  <button
                    type="submit"
                    disabled={deleting}
                    class="flex items-center justify-center gap-2 px-3 py-2 min-w-[44px] h-[44px] bg-red-600 dark:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:bg-red-700 dark:hover:bg-red-800 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                    title={deleting ? 'Deleting recipe...' : 'Delete this recipe'}
                  >
                    <Icon icon={deleting ? 'mdi:loading' : 'mdi:delete'} height="20" class={deleting ? 'animate-spin' : ''} />
                    <span class="hidden sm:inline whitespace-nowrap">{deleting ? 'Deleting...' : 'Delete'}</span>
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
              <div class="font-medium text-lg text-neutral-900 dark:text-neutral-50">{recipe.profiles?.username}</div>
              <div class="text-neutral-600 dark:text-neutral-400 text-sm">Recipe Creator</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Ingredients Section -->
    <div class="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-6 shadow-lg">
      <h2 class="font-bold text-2xl mb-4 text-neutral-900 dark:text-neutral-50">Ingredients</h2>
      <div class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="border-b border-neutral-300 dark:border-neutral-600">
              <th class="text-left px-4 py-3 font-semibold text-neutral-900 dark:text-neutral-50">Quantity</th>
              <th class="text-left px-4 py-3 font-semibold text-neutral-900 dark:text-neutral-50">Ingredient</th>
              <th class="text-left px-4 py-3 font-semibold text-neutral-900 dark:text-neutral-50">Nutrition</th>
            </tr>
          </thead>
          <tbody>
            {#each recipe.recipe_ingredients as recipeIngredient (recipeIngredient.id || recipeIngredient.ingredientid)}
              <tr class="border-b border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
                <td class="px-4 py-3 text-neutral-900 dark:text-neutral-50">
                  {recipeIngredient.quantity || 'N/A'}
                  {#if recipeIngredient.type && recipeIngredient.type.toLowerCase() !== 'none'}
                    {recipeIngredient.type}
                  {/if}
                </td>
                <td class="px-4 py-3 text-neutral-900 dark:text-neutral-50">
                  {recipeIngredient.ingredient?.name || recipeIngredient.ingredientid || 'N/A'}
                </td>
                <td class="px-4 py-3 text-neutral-600 dark:text-neutral-400">
                  {recipeIngredient.ingredients?.calories ?? '-'}kcal • {recipeIngredient.ingredients?.protein ?? '-'}g protein
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Method Section -->
    <div class="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-6 shadow-lg">
      <h2 class="font-bold text-2xl mb-4 text-neutral-900 dark:text-neutral-50">Method</h2>
      {#if recipe.method && recipe.method.length > 0}
        <div class="space-y-4">
          {#each recipe.method as step, index (index)}
            <div class="flex gap-4">
              <div class="flex-shrink-0 w-8 h-8 rounded-full bg-primary-500 dark:bg-primary-600 text-white flex items-center justify-center font-semibold shadow-md">
                {index + 1}
              </div>
              <div class="flex-1 pt-1">
                <p class="text-neutral-700 dark:text-neutral-300">{step}</p>
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <p class="text-neutral-500 dark:text-neutral-400 italic">No method steps provided.</p>
      {/if}
    </div>

    <!-- Comments Section -->
    <CommentSection
      recipeId={recipe.id}
      initialComments={data.comments || []}
      recipeOwnerId={recipe.user_id}
    />
  {/if}
</div>