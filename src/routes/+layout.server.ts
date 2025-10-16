import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ locals, cookies }) => {
  const { session, user } = await locals.safeGetSession()

  let profile: { id: string; username: string | null; avatar_url: string | null } | null = null
  if (user) {
    const { data, error } = await locals.supabase
      .from('profiles')
      .select('id, username, avatar_url, level')
      .eq('id', user.id)
      .single()
    if (!error) profile = data
  }

  return {
    profile,
    session,
    user,
    cookies: cookies.getAll(),
  }
}
