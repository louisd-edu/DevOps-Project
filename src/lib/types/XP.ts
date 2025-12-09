export type UserXP = {
  user_id: string;
  total_xp: number;
  created_at: string;
  updated_at: string;
};

export type XPTransaction = {
  id: string;
  user_id: string;
  xp_amount: number;
  action_type: string;
  source_table: string | null;
  source_id: string | null;
  related_user_id: string | null;
  description: string | null;
  created_at: string;
};

export type XPProgress = {
  currentLevel: number;
  totalXP: number;
  currentLevelXP: number;
  nextLevelXP: number;
  progressPercent: number;
};
