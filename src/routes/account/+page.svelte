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

	// keep the above state in sync when `profile` changes
	$effect(() => {
		fullName = profile?.full_name ?? ''
		username = profile?.username ?? ''
		website = profile?.website ?? ''
	avatarUrl = profile?.avatar_url ?? undefined
	})

	// ...

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
</script>

<div class="form-widget">
	<form
		class="form-widget"
		method="post"
		action="?/update"
		use:enhance={handleSubmit}
		bind:this={profileForm}
	>

		// ...

		<div class="form-widget">
        // ...
		<AvatarUpload
			{supabase}
			bind:url={avatarUrl}
			size={10}
			onupload={() => {
				profileForm.requestSubmit();
			}}
		/>
// ...
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
			<input id="username" name="username" type="text" value={form?.username ?? username} />
		</div>

		<div>
			<label for="website">Website</label>
			<input id="website" name="website" type="url" value={form?.website ?? website} />
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