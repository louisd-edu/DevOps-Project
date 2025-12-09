<script lang="ts">
  import { getContext } from "svelte";
  import type { Session } from "@supabase/supabase-js";
  import type { CommentWithProfile } from "$lib/types/Comment";
  import Avatar from "$lib/components/Avatar.svelte";
  import Icon from "@iconify/svelte";
  import { enhance } from "$app/forms";
  import ReplyForm from "./ReplyForm.svelte";
  import { formatDistanceToNow } from "$lib/utils/dateFormatter";

  interface Props {
    comment: CommentWithProfile;
    recipeId: string | number;
    isRecipeOwner: boolean;
    depth?: number;
    onLikeToggle?: (commentId: string) => void;
  }

  let {
    comment,
    recipeId,
    isRecipeOwner,
    depth = 0,
    onLikeToggle,
  }: Props = $props();

  const session = getContext<Session | null>("session");

  const isOwner = $derived(session?.user?.id === comment.user_id);
  const canDelete = $derived(isOwner || isRecipeOwner);

  let isEditing = $state(false);
  let isReplying = $state(false);
  let editContent = $state(comment.content);
  let isSubmitting = $state(false);
  let isDeleting = $state(false);

  function startEdit() {
    editContent = comment.content;
    isEditing = true;
  }

  function cancelEdit() {
    isEditing = false;
    editContent = comment.content;
  }

  function toggleReply() {
    isReplying = !isReplying;
  }

  const timeAgo = $derived(formatDistanceToNow(new Date(comment.created_at)));
</script>

<div class="flex gap-3 py-4" style="margin-left: {depth > 0 ? depth * 2 : 0}rem">
  <div class="flex-shrink-0">
    <Avatar url={comment.profiles?.avatar_url} size="h-10 w-10" />
  </div>

  <div class="flex-1 min-w-0">
    <div class="bg-neutral-200 dark:bg-neutral-700 rounded-lg p-3">
      <div class="flex items-start justify-between gap-2 mb-1">
        <div>
          <a
            href="/user/{comment.profiles?.username}"
            class="font-semibold text-neutral-900 dark:text-neutral-50 hover:text-primary-500 dark:hover:text-primary-400"
          >
            {comment.profiles?.displayname || comment.profiles?.username || "Unknown User"}
          </a>
          <span class="text-xs text-neutral-500 dark:text-neutral-400 ml-2">
            {timeAgo}
            {#if comment.is_edited}
              <span class="italic">(edited)</span>
            {/if}
          </span>
        </div>

        {#if isOwner}
          <div class="flex gap-1">
            <button
              type="button"
              onclick={startEdit}
              class="p-1 hover:bg-neutral-300 dark:hover:bg-neutral-600 rounded transition-colors"
              title="Edit comment"
            >
              <Icon icon="mdi:pencil" height="16" />
            </button>
          </div>
        {/if}
      </div>

      {#if isEditing}
        <form
          method="POST"
          action="?/editComment"
          use:enhance={() => {
            isSubmitting = true;
            return async ({ result, update }) => {
              if (result.type === "success") {
                isEditing = false;
              }
              isSubmitting = false;
              await update();
            };
          }}
        >
          <input type="hidden" name="comment_id" value={comment.id} />
          <textarea
            name="content"
            bind:value={editContent}
            class="w-full px-3 py-2 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600"
            rows="3"
            maxlength="1000"
            disabled={isSubmitting}
          ></textarea>
          <div class="flex gap-2 mt-2">
            <button
              type="submit"
              disabled={isSubmitting || editContent.trim().length === 0}
              class="px-3 py-1 bg-primary-500 hover:bg-primary-600 text-white rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onclick={cancelEdit}
              disabled={isSubmitting}
              class="px-3 py-1 bg-neutral-400 hover:bg-neutral-500 text-white rounded text-sm font-medium disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      {:else}
        <p class="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap break-words">
          {comment.content}
        </p>
      {/if}
    </div>

    <div class="flex items-center gap-4 mt-2 text-sm">
      {#if session}
        <form
          method="POST"
          action="?/toggleCommentLike"
          use:enhance={() => {
            onLikeToggle?.(comment.id);
            return async ({ update }) => {
              await update({ reset: false });
            };
          }}
        >
          <input type="hidden" name="comment_id" value={comment.id} />
          <button
            type="submit"
            class="flex items-center gap-1 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
          >
            <Icon
              icon={comment.user_has_liked ? "mdi:heart" : "mdi:heart-outline"}
              height="18"
              class={comment.user_has_liked ? "text-red-500" : ""}
            />
            <span class="text-neutral-600 dark:text-neutral-400">
              {comment.like_count || 0}
            </span>
          </button>
        </form>

        {#if depth < 5}
          <button
            type="button"
            onclick={toggleReply}
            class="text-neutral-600 dark:text-neutral-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
          >
            Reply
          </button>
        {/if}
      {:else}
        <span class="flex items-center gap-1 text-neutral-600 dark:text-neutral-400">
          <Icon icon="mdi:heart-outline" height="18" />
          {comment.like_count || 0}
        </span>
      {/if}

      {#if canDelete}
        <form
          method="POST"
          action="?/deleteComment"
          use:enhance={() => {
            if (!confirm("Are you sure you want to delete this comment?")) {
              return async () => {};
            }
            isDeleting = true;
            return async ({ result, update }) => {
              isDeleting = false;
              await update();
            };
          }}
        >
          <input type="hidden" name="comment_id" value={comment.id} />
          <button
            type="submit"
            disabled={isDeleting}
            class="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </form>
      {/if}
    </div>

    {#if isReplying && session}
      <div class="mt-3">
        <ReplyForm {recipeId} parentCommentId={comment.id} onCancel={toggleReply} />
      </div>
    {/if}
  </div>
</div>
