// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// Minimal Locals declarations used by hooks.server.ts
		interface Locals {
			// Supabase server client instance (use `any` to avoid adding supabase types)
			supabase?: any

			// helper to safely get a validated session and user
			safeGetSession?: () => Promise<{ session: any | null; user: any | null }>

			// populated in authGuard
			session?: any | null
			user?: any | null
		}

		// leave the rest as defaults
		// interface Error {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
