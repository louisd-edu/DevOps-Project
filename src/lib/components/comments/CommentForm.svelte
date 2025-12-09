<script lang="ts">
  import { enhance } from "$app/forms";
  import Icon from "@iconify/svelte";

  interface Props {
    recipeId: string | number;
  }

  let { recipeId }: Props = $props();

  let content = $state("");
  let isSubmitting = $state(false);
  let charCount = $derived(content.length);
  const maxChars = 1000;
</script>

<form
  method="POST"
  action="?/addComment"
  use:enhance={() => {
    isSubmitting = true;
    return async ({ result, update }) => {
      if (result.type === "success") {
        content = "";
      }
      isSubmitting = false;
      await update();
    };
  }}
  class="mb-6"
>
  <input type="hidden" name="recipe_id" value={recipeId} />

  <div class="relative">
    <textarea
      name="content"
      bind:value={content}
      placeholder="Add a comment..."
      class="w-full px-3 py-2 rounded-lg bg-neutral-200 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-neutral-50 placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600"
      rows="3"
      maxlength={maxChars}
      disabled={isSubmitting}
    ></textarea>

    <div class="flex items-center justify-between mt-2">
      <span
        class="text-xs"
        class:text-neutral-500={charCount < maxChars * 0.9}
        class:text-orange-600={charCount >= maxChars * 0.9 && charCount < maxChars}
        class:text-red-600={charCount >= maxChars}
      >
        {charCount} / {maxChars}
      </span>

      <button
        type="submit"
        disabled={isSubmitting || content.trim().length === 0}
        class="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
      >
        {#if isSubmitting}
          <Icon icon="mdi:loading" height="20" class="animate-spin" />
          Posting...
        {:else}
          <Icon icon="mdi:send" height="20" />
          Post Comment
        {/if}
      </button>
    </div>
  </div>
</form>
