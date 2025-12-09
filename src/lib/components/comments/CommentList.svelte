<script lang="ts">
  import type { CommentWithProfile } from "$lib/types/Comment";
  import Comment from "./Comment.svelte";
  import CommentList from "./CommentList.svelte";

  interface Props {
    comments: CommentWithProfile[];
    recipeId: string | number;
    isRecipeOwner: boolean;
    depth?: number;
    onLikeToggle?: (commentId: string) => void;
  }

  let { comments, recipeId, isRecipeOwner, depth = 0, onLikeToggle }: Props = $props();
</script>

<div class="space-y-1">
  {#each comments as comment (comment.id)}
    <div>
      <Comment {comment} {recipeId} {isRecipeOwner} {depth} {onLikeToggle} />

      {#if comment.replies && comment.replies.length > 0}
        <CommentList
          comments={comment.replies}
          {recipeId}
          {isRecipeOwner}
          depth={depth + 1}
          {onLikeToggle}
        />
      {/if}
    </div>
  {/each}
</div>
