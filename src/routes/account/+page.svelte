<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
    import AvatarUpload from "$lib/components/AvatarUpload.svelte";

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
		fullName = form?.fullName ?? profile?.full_name ?? ''
		username = form?.username ?? profile?.username ?? ''
		website = form?.website ?? profile?.website ?? ''
		avatarUrl = profile?.avatar_url ?? undefined
		showFavoritesPublic = form?.showFavoritesPublic ?? profile?.show_favorites_public ?? true
		showSavedPublic = form?.showSavedPublic ?? profile?.show_saved_public ?? true
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

<div class="form-widget">
	<form
		class="form-widget"
		method="post"
		action="?/update"
		use:enhance={handleSubmit}
		bind:this={profileForm}
	>
		<div class="form-widget">
			<AvatarUpload
				{supabase}
				bind:url={avatarUrl}
				size={10}
				onupload={() => {
					profileForm.requestSubmit();
				}}
			/>
		</div>

		<div>
			<label for="email">Email</label>
			<input id="email" type="text" value={session.user.email} disabled />
		</div>

		<div>
			<label for="fullName">Full Name</label>
			<input id="fullName" name="fullName" type="text" value={form?.fullName ?? fullName} />
		</div>

		<div>
			<label for="username">Username</label>
			<input
				id="username"
				name="username"
				type="text"
				bind:value={username}
				autocomplete="username"
				autocapitalize="none"
				spellcheck={false}
				oninput={handleUsernameInput}
			/>
		</div>

		<div>
			<label for="website">Website</label>
			<input id="website" name="website" type="url" value={form?.website ?? website} />
		</div>

		<div class="privacy-settings">
			<h3>Privacy Settings</h3>
			<div class="privacy-option">
				<label for="showFavoritesPublic">
					<input
						id="showFavoritesPublic"
						name="showFavoritesPublic"
						type="checkbox"
						bind:checked={showFavoritesPublic}
					/>
					Make my liked recipes public
				</label>
			</div>
			<div class="privacy-option">
				<label for="showSavedPublic">
					<input
						id="showSavedPublic"
						name="showSavedPublic"
						type="checkbox"
						bind:checked={showSavedPublic}
					/>
					Make my saved recipes public
				</label>
			</div>
		</div>

		<div>
			<input
				type="submit"
				class="button block primary"
				value={loading ? 'Loading...' : 'Update'}
				disabled={loading}
			/>
		</div>
	</form>

	<form method="post" action="?/signout" use:enhance={handleSignOut}>
		<div>
			<button class="button block" disabled={loading}>Sign Out</button>
		</div>
	</form>
</div>

<style>
	/* Removed inline error UI since we enforce silently */
	.privacy-settings {
		margin-top: 1.5rem;
		padding-top: 1.5rem;
		border-top: 1px solid #e5e7eb;
	}

	.privacy-settings h3 {
		font-size: 1.125rem;
		font-weight: 600;
		margin-bottom: 1rem;
	}

	.privacy-option {
		margin-bottom: 0.75rem;
	}

	.privacy-option label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
	}

	.privacy-option input[type="checkbox"] {
		width: 1.25rem;
		height: 1.25rem;
		cursor: pointer;
	}
</style>
