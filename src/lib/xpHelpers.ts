import type { SupabaseClient } from "@supabase/supabase-js";
import type { UserXP, XPTransaction, XPProgress } from "./types/XP";

/**
 * Calculate XP required for a given level.
 * Formula: 10 * (level^2 / 2) = 5 * (level-1)^2
 * Level 1: 0, Level 2: 5, Level 3: 20, Level 4: 45, Level 5: 80
 */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return 5 * (level - 1) * (level - 1);
}

/**
 * Calculate level from total XP.
 * Inverse: level = floor(sqrt(xp / 5) + 1)
 */
export function calculateLevel(totalXP: number): number {
  if (totalXP <= 0) return 1;
  return Math.floor(Math.sqrt(totalXP / 5) + 1);
}

/**
 * Get XP progress information for UI display.
 */
export function getXPProgress(totalXP: number): XPProgress {
  const currentLevel = calculateLevel(totalXP);
  const currentLevelXP = xpForLevel(currentLevel);
  const nextLevelXP = xpForLevel(currentLevel + 1);
  const xpIntoLevel = totalXP - currentLevelXP;
  const xpNeededForNext = nextLevelXP - currentLevelXP;
  const progressPercent =
    xpNeededForNext > 0
      ? Math.min(100, Math.floor((xpIntoLevel / xpNeededForNext) * 100))
      : 100;

  return {
    currentLevel,
    totalXP,
    currentLevelXP,
    nextLevelXP,
    progressPercent,
  };
}

/**
 * Fetch user's XP data from database.
 */
export async function fetchUserXP(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserXP | null> {
  const { data, error } = await supabase
    .from("user_xp")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.warn("Error fetching user XP:", error.message);
    return null;
  }
  return data;
}

/**
 * Fetch user's recent XP transactions.
 */
export async function fetchXPTransactions(
  supabase: SupabaseClient,
  userId: string,
  limit = 20,
): Promise<XPTransaction[]> {
  const { data, error } = await supabase
    .from("xp_transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.warn("Error fetching XP transactions:", error.message);
    return [];
  }
  return data ?? [];
}
