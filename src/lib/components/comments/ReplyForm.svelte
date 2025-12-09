<script lang="ts">
  import { enhance } from "$app/forms";

  interface Props {
    recipeId: string | number;
    parentCommentId: string;
    onCancel: () => void;
  }

  let { recipeId, parentCommentId, onCancel }: Props = $props();

  let content = $state("");
  let isSubmitting = $state(false);
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
        onCancel();
      }
      isSubmitting = false;
      await update();
    };
  }}
>
  <input type="hidden" name="recipe_id" value={recipeId} />
  <input type="hidden" name="parent_comment_id" value={parentCommentId} />

  <textarea
    name="content"
    bind:value={content}
    placeholder="Write a reply..."
    class="w-full px-3 py-2 rounded bg-neutral-200 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-neutral-50 placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600"
    rows="2"
    maxlength={maxChars}
    disabled={isSubmitting}
  ></textarea>

  <div class="flex gap-2 mt-2">
    <button
      type="submit"
      disabled={isSubmitting || content.trim().length === 0}
      class="px-3 py-1 bg-primary-500 hover:bg-primary-600 text-white rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isSubmitting ? "Posting..." : "Reply"}
    </button>
    <button
      type="button"
      onclick={onCancel}
      disabled={isSubmitting}
      class="px-3 py-1 bg-neutral-400 hover:bg-neutral-500 text-white rounded text-sm font-medium disabled:opacity-50"
    >
      Cancel
    </button>
  </div>
</form>
