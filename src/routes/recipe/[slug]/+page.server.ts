// src/routes/[slug]/+page.server.ts
import type { Actions, PageServerLoad } from "./$types";
import { fail, redirect } from "@sveltejs/kit";
import type { CommentWithProfile } from "$lib/types/Comment";

export const load: PageServerLoad = async ({ params, locals, url }) => {
  const { supabase, safeGetSession } = locals;
  const { session } = await safeGetSession();
  const { slug } = params;

  // Get token from query params for private recipe access
  const token = url.searchParams.get("token");

  const { data, error } = await supabase
    .from("recipes")
    .select(
      `
      *,
      profiles ( username, avatar_url, level ),
      recipe_ingredients(*, ingredients(*, name, calories, protein) )
    `,
    )
    .eq("id", slug)
    .single();

  if (data) {
    console.log("Fetched recipe data:", data.recipe_ingredients);
  }

  if (error) {
    console.error("Error fetching recipe:", error);
    return { error: error.message };
  }

  // Access control check
  const isOwner = session?.user?.id === data.user_id;

  if (!data.is_public) {
    // Recipe is private - check authorization
    if (isOwner) {
      // Owner can always view their own recipes
    } else if (token && token === data.share_token) {
      // Valid token provided
    } else {
      // Unauthorized: no token or invalid token
      return {
        error: "This recipe is private. You need a valid link to view it.",
        unauthorized: true,
      };
    }
  }
  // Public recipes are accessible to everyone

  // Helper to convert a storage path to a public URL (no-op if already a URL)
  function toPublicUrl(
    path: string | null | undefined,
    bucket: string,
  ): string | null {
    if (!path) return null;
    if (/^https?:\/\//.test(path)) return path;
    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
    return pub?.publicUrl ?? null;
  }

  // Normalize recipe image URL
  const recipeData = data as Record<string, unknown>;
  const recipeImagePath = (recipeData.recipeimageurl ??
    recipeData.recipeImage ??
    null) as string | null;
  const publicRecipeUrl = toPublicUrl(recipeImagePath, "recipeimages");
  recipeData.recipeImageUrl = publicRecipeUrl;

  // Normalize avatar URL on nested profile
  const profiles = recipeData.profiles as Record<string, unknown> | undefined;
  if (profiles?.avatar_url) {
    profiles.avatar_url = toPublicUrl(profiles.avatar_url as string, "avatars");
  }

  // Fetch comments with profiles and like counts
  let comments: CommentWithProfile[] = [];

  if (data) {
    const userId = session?.user?.id;

    // Fetch all comments for this recipe with profile info
    const { data: commentsData, error: commentsError } = await supabase
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
      .eq("recipe_id", slug)
      .order("created_at", { ascending: true });

    if (commentsError) {
      console.error("Error fetching comments:", commentsError);
    } else if (commentsData) {
      // Fetch like counts for all comments
      const commentIds = commentsData.map((c) => c.id);

      const { data: likesData } = await supabase
        .from("comment_likes")
        .select("comment_id, user_id")
        .in("comment_id", commentIds);

      // Build like count map and user's liked comments
      const likeCounts = new Map<string, number>();
      const userLikes = new Set<string>();

      if (likesData) {
        for (const like of likesData) {
          likeCounts.set(like.comment_id, (likeCounts.get(like.comment_id) || 0) + 1);
          if (userId && like.user_id === userId) {
            userLikes.add(like.comment_id);
          }
        }
      }

      // Transform comments with like data
      comments = commentsData.map((comment) => ({
        ...comment,
        like_count: likeCounts.get(comment.id) || 0,
        user_has_liked: userLikes.has(comment.id),
        replies: [],
      }));

      // Build threaded structure (nest replies)
      const commentMap = new Map<string, CommentWithProfile>();
      const topLevelComments: CommentWithProfile[] = [];

      // First pass: create map
      for (const comment of comments) {
        commentMap.set(comment.id, { ...comment, replies: [] });
      }

      // Second pass: build tree
      for (const comment of comments) {
        const commentNode = commentMap.get(comment.id)!;
        if (comment.parent_comment_id) {
          const parent = commentMap.get(comment.parent_comment_id);
          if (parent) {
            parent.replies!.push(commentNode);
          } else {
            // Orphaned reply (parent deleted), treat as top-level
            topLevelComments.push(commentNode);
          }
        } else {
          topLevelComments.push(commentNode);
        }
      }

      comments = topLevelComments;
    }
  }

  return {
    recipe: data,
    comments,
  };
};

export const actions: Actions = {
  delete: async ({ params, locals }) => {
    const { supabase, safeGetSession } = locals;
    const { session } = await safeGetSession();
    const { slug } = params;

    if (!session) {
      return fail(401, { message: "Unauthorized" });
    }

    // Verify ownership
    const { data: recipe } = await supabase
      .from("recipes")
      .select("user_id")
      .eq("id", slug)
      .single();

    if (!recipe || recipe.user_id !== session.user.id) {
      return fail(403, { message: "Forbidden - You don't own this recipe" });
    }

    // Get user's username from profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", session.user.id)
      .single();

    // Delete the recipe (this will cascade to recipe_ingredients due to foreign key)
    const { error } = await supabase.from("recipes").delete().eq("id", slug);

    if (error) {
      console.error("Error deleting recipe:", error);
      return fail(500, { message: "Failed to delete recipe" });
    }

    // Redirect to user's profile (or home if username not found)
    const redirectUrl = profile?.username ? `/user/${profile.username}` : "/";
    throw redirect(303, redirectUrl);
  },

  addComment: async ({ request, params, locals }) => {
    const { supabase, safeGetSession } = locals;
    const { session } = await safeGetSession();
    const { slug } = params;

    if (!session) {
      return fail(401, { message: "You must be logged in to comment" });
    }

    const formData = await request.formData();
    const content = (formData.get("content") as string)?.trim();
    const parentCommentId = (formData.get("parent_comment_id") as string) || null;

    // Validation
    if (!content || content.length === 0) {
      return fail(400, { message: "Comment cannot be empty" });
    }

    if (content.length > 1000) {
      return fail(400, { message: "Comment must be 1000 characters or less" });
    }

    // Verify recipe exists
    const { data: recipe } = await supabase
      .from("recipes")
      .select("id")
      .eq("id", slug)
      .single();

    if (!recipe) {
      return fail(404, { message: "Recipe not found" });
    }

    // Insert comment
    const { data: comment, error } = await supabase
      .from("comments")
      .insert({
        recipe_id: slug,
        user_id: session.user.id,
        parent_comment_id: parentCommentId,
        content,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding comment:", error);
      return fail(500, { message: "Failed to add comment" });
    }

    return { success: true, comment };
  },

  editComment: async ({ request, locals }) => {
    const { supabase, safeGetSession } = locals;
    const { session } = await safeGetSession();

    if (!session) {
      return fail(401, { message: "Unauthorized" });
    }

    const formData = await request.formData();
    const commentId = formData.get("comment_id") as string;
    const content = (formData.get("content") as string)?.trim();

    // Validation
    if (!content || content.length === 0) {
      return fail(400, { message: "Comment cannot be empty" });
    }

    if (content.length > 1000) {
      return fail(400, { message: "Comment must be 1000 characters or less" });
    }

    // Verify ownership (RLS will also enforce this)
    const { data: existingComment } = await supabase
      .from("comments")
      .select("user_id")
      .eq("id", commentId)
      .single();

    if (!existingComment || existingComment.user_id !== session.user.id) {
      return fail(403, { message: "You can only edit your own comments" });
    }

    // Update comment
    const { error } = await supabase
      .from("comments")
      .update({ content })
      .eq("id", commentId);

    if (error) {
      console.error("Error editing comment:", error);
      return fail(500, { message: "Failed to edit comment" });
    }

    return { success: true };
  },

  deleteComment: async ({ request, params, locals }) => {
    const { supabase, safeGetSession } = locals;
    const { session } = await safeGetSession();
    const { slug } = params;

    if (!session) {
      return fail(401, { message: "Unauthorized" });
    }

    const formData = await request.formData();
    const commentId = formData.get("comment_id") as string;

    // Fetch comment with recipe info to check permissions
    const { data: comment } = await supabase
      .from("comments")
      .select("user_id, recipe_id")
      .eq("id", commentId)
      .single();

    if (!comment) {
      return fail(404, { message: "Comment not found" });
    }

    // Check if user owns comment or owns the recipe
    const { data: recipe } = await supabase
      .from("recipes")
      .select("user_id")
      .eq("id", slug)
      .single();

    const isCommentOwner = comment.user_id === session.user.id;
    const isRecipeOwner = recipe?.user_id === session.user.id;

    if (!isCommentOwner && !isRecipeOwner) {
      return fail(403, {
        message: "You can only delete your own comments or comments on your recipes",
      });
    }

    // Delete comment (CASCADE will handle replies and likes)
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      console.error("Error deleting comment:", error);
      return fail(500, { message: "Failed to delete comment" });
    }

    return { success: true };
  },

  toggleCommentLike: async ({ request, locals }) => {
    const { supabase, safeGetSession } = locals;
    const { session } = await safeGetSession();

    if (!session) {
      return fail(401, { message: "You must be logged in to like comments" });
    }

    const formData = await request.formData();
    const commentId = formData.get("comment_id") as string;

    // Check if already liked
    const { data: existingLike } = await supabase
      .from("comment_likes")
      .select("id")
      .eq("comment_id", commentId)
      .eq("user_id", session.user.id)
      .single();

    if (existingLike) {
      // Unlike
      const { error } = await supabase
        .from("comment_likes")
        .delete()
        .eq("id", existingLike.id);

      if (error) {
        console.error("Error unliking comment:", error);
        return fail(500, { message: "Failed to unlike comment" });
      }

      return { success: true, action: "unliked" };
    } else {
      // Like
      const { error } = await supabase
        .from("comment_likes")
        .insert({
          comment_id: commentId,
          user_id: session.user.id,
        });

      if (error) {
        console.error("Error liking comment:", error);
        return fail(500, { message: "Failed to like comment" });
      }

      return { success: true, action: "liked" };
    }
  },
};
