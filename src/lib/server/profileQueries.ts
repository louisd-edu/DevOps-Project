import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Gets basic profile information for the current user (used in layout)
 * @param supabase - Supabase client instance
 * @param userId - User ID
 * @returns Profile with id, username, avatar_url, and level
 */
export async function getBasicProfile(supabase: SupabaseClient, userId: string) {
	const { data, error } = await supabase
		.from('profiles')
		.select('id, username, avatar_url, level')
		.eq('id', userId)
		.single();

	return { data, error };
}

/**
 * Gets account profile information (used in account settings)
 * @param supabase - Supabase client instance
 * @param userId - User ID
 * @returns Profile with username, full_name, website, and avatar_url
 */
export async function getAccountProfile(supabase: SupabaseClient, userId: string) {
	const { data, error } = await supabase
		.from('profiles')
		.select('username, full_name, website, avatar_url')
		.eq('id', userId)
		.single();

	return { data, error };
}

/**
 * Gets full profile information by username (used in user profile page)
 * @param supabase - Supabase client instance
 * @param username - Username to look up
 * @returns Complete profile data
 */
export async function getProfileByUsername(supabase: SupabaseClient, username: string) {
	const { data, error } = await supabase
		.from('profiles')
		.select('*')
		.eq('username', username)
		.single();

	return { data, error };
}
