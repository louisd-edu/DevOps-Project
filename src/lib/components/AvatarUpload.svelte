<script lang="ts">
	import type { SupabaseClient } from '@supabase/supabase-js';
	import AvatarCropper from '$lib/components/AvatarCropper.svelte';

	interface Props {
		size?: number;
		url?: string;
		supabase: SupabaseClient;
		onupload?: () => void;
	}

	let { size = 10, url = $bindable(), supabase, onupload }: Props = $props();

	let avatarUrl: string | null = $state(null);
	let uploading = $state(false);
	let files: FileList | undefined = $state();

	let selectedImage: string | null = $state(null);
	let croppedFile: File | null = $state(null);

	const downloadImage = async (path: string) => {
		try {
			const { data, error } = await supabase.storage.from('avatars').download(path);
			if (error) throw error;

			const url = URL.createObjectURL(data);
			avatarUrl = url;
		} catch (error) {
			if (error instanceof Error) {
				console.log('Error downloading image: ', error.message);
			}
		}
	};

	const handleFileSelect = (event: Event) => {
		const target = event.target as HTMLInputElement;
		const files = target.files;
		if (files && files.length > 0) {
			const reader = new FileReader();
			reader.onload = (e) => {
				selectedImage = e.target?.result as string;
			};
			reader.readAsDataURL(files[0]);
		}
	};

	const handleCrop = async (event: CustomEvent<{ file: File }>) => {
		croppedFile = event.detail.file;
		await uploadAvatar();
	};

	const uploadAvatar = async () => {
		try {
			uploading = true;

			if (!croppedFile) throw new Error('no cropped image found.');
			const file = croppedFile;

			const fileExt = file.name.split('.').pop();
			const filePath = `${Math.random().toString(36).substring(2)}.${fileExt}`;

			const { error } = await supabase.storage.from('avatars').upload(filePath, file, {
				upsert: true
			});

			if (error) throw error;

			url = filePath;
			setTimeout(() => {
				onupload?.();
			}, 100);

			await downloadImage(filePath);
			
		} catch (error) {
			if (error instanceof Error) {
				alert(error.message);
			}
		} finally {
			uploading = false;
		}
	};

	$effect(() => {
		if (url) downloadImage(url);
	});
</script>

<div>
	{#if selectedImage}
		<AvatarCropper
			selectedImage={selectedImage}
			on:cropped={(e) => {
				handleCrop(e);
				selectedImage = null;
			}}
			aspectRatio={1}
		/>
	{:else}
		{#if avatarUrl}
			<img
				src={avatarUrl}
				alt={avatarUrl ? 'AvatarUpload' : 'No image'}
				class="avatar image"
				style="height: {size}em; width: {size}em;"
			/>
		{:else}
			<div class="avatar no-image" style="height: {size}em; width: {size}em;"></div>
		{/if}

		<input type="hidden" name="avatarUrl" value={url} />

		<div style="width: {size}em;">
			<label class="button primary block" for="single">
				{uploading ? 'Uploading ...' : 'Upload'}
			</label>
			<input
				style="visibility: hidden; position:absolute;"
				type="file"
				id="single"
				accept="image/*"
				on:change={handleFileSelect}
				disabled={uploading}
			/>
		</div>
	{/if}
</div>

<style>
	.avatar {
		border-radius: 50%;
		object-fit: cover;
	}

	.no-image {
		background-color: #e5e7eb;
	}

	.button {
		background: #2563eb;
		color: white;
		padding: 0.6rem 1rem;
		border-radius: 8px;
		cursor: pointer;
		text-align: center;
		display: inline-block;
	}

	img {
		display: block;
		margin: auto;
		border-radius: 50%;
	}
</style>
