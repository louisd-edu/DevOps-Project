<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
    import AvatarUpload from "$lib/components/AvatarUpload.svelte";
    import type {Profile} from "$lib/types/Profile";

	// ...

	let { data, form } = $props()
	let { session, supabase, profile } = $derived(data)
	let profileForm: HTMLFormElement
	let loading = $state(false)
	// use $state for values that will be updated/reactive
	let fullName: string = $state('')
	let username: string = $state('')
	let website: string = $state('')
	let avatarUrl: string | undefined = $state<string | undefined>(undefined)
	let showFavoritesPublic: boolean = $state(true)
	let showSavedPublic: boolean = $state(true)

	// keep the above state in sync when `profile` or `form` changes
	$effect(() => {
		const p = profile as Profile | null;
		fullName = form?.fullName ?? profile?.full_name ?? ''
		username = form?.username ?? profile?.username ?? ''
		website = form?.website ?? profile?.website ?? ''
		avatarUrl = profile?.avatar_url ?? undefined
		showFavoritesPublic = form?.showFavoritesPublic ?? p?.show_favorites_public ?? true
		showSavedPublic = form?.showSavedPublic ?? p?.show_saved_public ?? true
	})

	// normalize username as lowercase with no spaces (silent enforcement, no error UI)
	function normalizeUsername(v: string): string {
		return v.toLowerCase().replace(/\s+/g, '')
	}
	$effect(() => {
		const norm = normalizeUsername(username ?? '')
		if (norm !== (username ?? '')) username = norm
	})

	const handleSubmit: SubmitFunction = () => {
		loading = true
		return async () => {
			loading = false
		}
	}

	const handleSignOut: SubmitFunction = () => {
		loading = true
		return async ({ update }) => {
			loading = false
			update()
		}
	}

	function handleUsernameInput(e: Event) {
		const t = e.currentTarget as HTMLInputElement
		const norm = normalizeUsername(t.value)
		if (t.value !== norm) t.value = norm
		username = norm
	}
</script>

<div class="container mx-auto max-w-4xl p-6">
	<h1 class="mb-6 text-3xl font-bold text-neutral-900 dark:text-neutral-50">Account Settings</h1>

	<div class="space-y-6">
		<!-- Avatar Upload Card -->
		<div class="rounded-lg bg-neutral-100 dark:bg-neutral-800 p-6 shadow-lg">
			<h2 class="mb-4 text-xl font-semibold text-neutral-900 dark:text-neutral-50">Profile Picture</h2>
			<AvatarUpload
				{supabase}
				bind:url={avatarUrl}
				size={10}
				onupload={() => {
					profileForm.requestSubmit();
				}}
			/>
		</div>

		<!-- Profile Information Card -->
		<form
			method="post"
			action="?/update"
			use:enhance={handleSubmit}
			bind:this={profileForm}
			class="rounded-lg bg-neutral-100 dark:bg-neutral-800 p-6 shadow-lg space-y-4"
		>
			<h2 class="text-xl font-semibold text-neutral-900 dark:text-neutral-50">Profile Information</h2>

			<div>
				<label for="email" class="mb-1 block font-medium text-neutral-900 dark:text-neutral-50">Email</label>
				<input
					id="email"
					type="text"
					value={session.user.email}
					disabled
					class="w-full rounded bg-neutral-300 dark:bg-neutral-700 border border-neutral-400 dark:border-neutral-600 px-3 py-2 text-neutral-600 dark:text-neutral-400 cursor-not-allowed"
				/>
			</div>

			<div>
				<label for="fullName" class="mb-1 block font-medium text-neutral-900 dark:text-neutral-50">Full Name</label>
				<input
					id="fullName"
					name="fullName"
					type="text"
					value={form?.fullName ?? fullName}
					class="w-full rounded bg-neutral-200 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 px-3 py-2 text-neutral-900 dark:text-neutral-50 placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600"
				/>
			</div>

			<div>
				<label for="username" class="mb-1 block font-medium text-neutral-900 dark:text-neutral-50">Username</label>
				<input
					id="username"
					name="username"
					type="text"
					bind:value={username}
					autocomplete="username"
					autocapitalize="none"
					spellcheck={false}
					oninput={handleUsernameInput}
					class="w-full rounded bg-neutral-200 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 px-3 py-2 text-neutral-900 dark:text-neutral-50 placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600"
				/>
			</div>

			<div>
				<label for="website" class="mb-1 block font-medium text-neutral-900 dark:text-neutral-50">Website</label>
				<input
					id="website"
					name="website"
					type="url"
					value={form?.website ?? website}
					class="w-full rounded bg-neutral-200 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 px-3 py-2 text-neutral-900 dark:text-neutral-50 placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600"
				/>
			</div>

			<div class="pt-4">
				<button
					type="submit"
					disabled={loading}
					class="w-full rounded bg-primary-500 dark:bg-primary-600 px-6 py-3 font-semibold text-white hover:bg-primary-600 dark:hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50 shadow-lg transition-colors"
				>
					{loading ? 'Updating...' : 'Update Profile'}
				</button>
			</div>
		</form>

		<!-- Privacy Settings Card -->
		<div class="rounded-lg bg-neutral-100 dark:bg-neutral-800 p-6 shadow-lg space-y-4">
			<h2 class="text-xl font-semibold text-neutral-900 dark:text-neutral-50">Privacy Settings</h2>

			<div class="space-y-3">
				<div class="flex items-center gap-3 p-3 border border-neutral-300 dark:border-neutral-600 rounded bg-neutral-200 dark:bg-neutral-700">
					<input
						id="showFavoritesPublic"
						name="showFavoritesPublic"
						type="checkbox"
						bind:checked={showFavoritesPublic}
						class="h-5 w-5"
						onchange={() => profileForm.requestSubmit()}
					/>
					<label for="showFavoritesPublic" class="cursor-pointer flex-1">
						<span class="font-medium text-neutral-900 dark:text-neutral-50">Make my liked recipes public</span>
						<span class="block text-neutral-600 dark:text-neutral-400 text-sm">
							Allow others to see recipes you've liked
						</span>
					</label>
				</div>

				<div class="flex items-center gap-3 p-3 border border-neutral-300 dark:border-neutral-600 rounded bg-neutral-200 dark:bg-neutral-700">
					<input
						id="showSavedPublic"
						name="showSavedPublic"
						type="checkbox"
						bind:checked={showSavedPublic}
						class="h-5 w-5"
						onchange={() => profileForm.requestSubmit()}
					/>
					<label for="showSavedPublic" class="cursor-pointer flex-1">
						<span class="font-medium text-neutral-900 dark:text-neutral-50">Make my saved recipes public</span>
						<span class="block text-neutral-600 dark:text-neutral-400 text-sm">
							Allow others to see recipes you've saved
						</span>
					</label>
				</div>
			</div>
		</div>

		<!-- Sign Out Card -->
		<form method="post" action="?/signout" use:enhance={handleSignOut} class="rounded-lg bg-neutral-100 dark:bg-neutral-800 p-6 shadow-lg">
			<h2 class="text-xl font-semibold text-neutral-900 dark:text-neutral-50 mb-4">Account Actions</h2>
			<button
				type="submit"
				disabled={loading}
				class="w-full rounded bg-red-600 dark:bg-red-700 px-6 py-3 font-semibold text-white hover:bg-red-700 dark:hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50 shadow-lg transition-colors"
			>
				Sign Out
			</button>
		</form>
	</div>
</div>

