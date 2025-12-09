<script lang="ts">
  import { getContext, onMount } from "svelte";
  import type { Session, SupabaseClient } from "@supabase/supabase-js";
  import type { CommentWithProfile } from "$lib/types/Comment";
  import CommentForm from "./CommentForm.svelte";
  import CommentList from "./CommentList.svelte";

  interface Props {
    recipeId: string | number;
    initialComments: CommentWithProfile[];
    recipeOwnerId: string;
  }

  let { recipeId, initialComments, recipeOwnerId }: Props = $props();

  const supabase = getContext<SupabaseClient>("supabase");
  const session = getContext<Session | null>("session");

  let comments = $state<CommentWithProfile[]>(initialComments);
  let isSubscribed = $state(false);

  // Real-time subscription
  onMount(() => {
    const channel = supabase
      .channel(`recipe-${recipeId}-comments`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `recipe_id=eq.${recipeId}`,
        },
        async (payload) => {
          console.log("Comment change:", payload);

          if (payload.eventType === "INSERT") {
            // Fetch the new comment with profile data
            const { data: newComment } = await supabase
              .from("comments")
              .select(`
                *,
                profiles!user_id (
                  id,
                  username,
                  avatar_url,
                  level,
                  displayname
                )
              `)
              .eq("id", payload.new.id)
              .single();

            if (newComment) {
              const commentWithLikes: CommentWithProfile = {
                ...newComment,
                like_count: 0,
                user_has_liked: false,
                replies: [],
              };

              if (newComment.parent_comment_id) {
                // Add as reply
                comments = addReply(comments, newComment.parent_comment_id, commentWithLikes);
              } else {
                // Add as top-level comment
                comments = [...comments, commentWithLikes];
              }
            }
          } else if (payload.eventType === "UPDATE") {
            comments = updateComment(comments, payload.new.id, payload.new);
          } else if (payload.eventType === "DELETE") {
            comments = removeComment(comments, payload.old.id);
          }
        }
      )
      .subscribe((status) => {
        isSubscribed = status === "SUBSCRIBED";
      });

    return () => {
      supabase.removeChannel(channel);
    };
  });

  // Helper functions for nested comment updates
  function addReply(
    commentList: CommentWithProfile[],
    parentId: string,
    reply: CommentWithProfile
  ): CommentWithProfile[] {
    return commentList.map((comment) => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), reply],
        };
      } else if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: addReply(comment.replies, parentId, reply),
        };
      }
      return comment;
    });
  }

  function updateComment(
    commentList: CommentWithProfile[],
    id: string,
    updates: Partial<CommentWithProfile>
  ): CommentWithProfile[] {
    return commentList.map((comment) => {
      if (comment.id === id) {
        return { ...comment, ...updates };
      } else if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: updateComment(comment.replies, id, updates),
        };
      }
      return comment;
    });
  }

  function removeComment(commentList: CommentWithProfile[], id: string): CommentWithProfile[] {
    return commentList
      .filter((comment) => comment.id !== id)
      .map((comment) => {
        if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: removeComment(comment.replies, id),
          };
        }
        return comment;
      });
  }

  // Optimistic update for likes
  function handleLikeToggle(commentId: string) {
    // Find the comment to get current state
    const findComment = (list: CommentWithProfile[]): CommentWithProfile | null => {
      for (const comment of list) {
        if (comment.id === commentId) return comment;
        if (comment.replies && comment.replies.length > 0) {
          const found = findComment(comment.replies);
          if (found) return found;
        }
      }
      return null;
    };

    const comment = findComment(comments);
    if (comment) {
      // Toggle the like state optimistically
      const newLikeCount = comment.user_has_liked
        ? (comment.like_count || 1) - 1
        : (comment.like_count || 0) + 1;

      comments = updateComment(comments, commentId, {
        like_count: newLikeCount,
        user_has_liked: !comment.user_has_liked,
      });
    }
  }

  const isRecipeOwner = $derived(session?.user?.id === recipeOwnerId);
</script>

<div class="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-6 shadow-lg">
  <div class="flex items-center justify-between mb-4">
    <h2 class="font-bold text-2xl text-neutral-900 dark:text-neutral-50">
      Comments ({comments.length})
    </h2>
    {#if isSubscribed}
      <div class="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
        <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        Live
      </div>
    {/if}
  </div>

  {#if session}
    <CommentForm {recipeId} />
  {:else}
    <div class="bg-neutral-200 dark:bg-neutral-700 rounded-lg p-4 text-center">
      <p class="text-neutral-600 dark:text-neutral-400">
        Please <a href="/auth" class="text-primary-500 hover:underline">sign in</a> to leave a comment
      </p>
    </div>
  {/if}

  <div class="mt-6">
    {#if comments.length === 0}
      <p class="text-neutral-500 dark:text-neutral-400 text-center py-8 italic">
        No comments yet. Be the first to comment!
      </p>
    {:else}
      <CommentList {comments} {recipeId} {isRecipeOwner} onLikeToggle={handleLikeToggle} />
    {/if}
  </div>
</div>
