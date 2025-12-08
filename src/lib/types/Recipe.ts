import type { Profile } from "./Profile";

export type { Profile };

export type Recipe = {
  id: string | number;
  user_id: string;
  recipename: string;
  recipeimageurl: string | null;
  cuisine: string | null;
  cookingtime: number | null;
  // the query in +layout.server.ts requests a nested profiles object
  profiles: Profile;
  profileAvatar: string | null;
  // Privacy fields
  is_public: boolean;
  share_token: string | null;
};
