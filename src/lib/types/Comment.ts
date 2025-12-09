import type { Profile } from "./Profile";

export type Comment = {
  id: string;
  recipe_id: number | string;
  user_id: string;
  parent_comment_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
  is_edited: boolean;
};

export type CommentWithProfile = Comment & {
  profiles: Profile;
  like_count: number;
  user_has_liked: boolean;
  replies?: CommentWithProfile[];
};

export type CommentLike = {
  id: string;
  comment_id: string;
  user_id: string;
  created_at: string;
};

export type CommentFormData = {
  content: string;
  parent_comment_id?: string | null;
};
