export type Profile = {
  id: string | number;
  username: string | null;
  displayname: string | null;
  avatar_url: string | null;
  level: number | null;
  show_favorites_public: boolean | null;
  show_saved_public: boolean | null;
};
