<script lang="ts">
	import type { SupabaseClient } from "@supabase/supabase-js";
	import RecipeImageCropper from "$lib/components/RecipeImageCropper.svelte";

	interface Props {
		url?: string;
		sb: SupabaseClient;
		userId: string;
		onupload?: () => void;
	}

	let { url = $bindable(), sb, userId, onupload }: Props = $props();

	let recipeImageUrl: string | null = $state(null);
	let uploading = $state(false);

	let selectedImage: string | null = $state(null);
	let croppedFile: File | null = $state(null);

	const downloadImage = async (path: string) => {
		try {
			const { data, error } = await sb.storage
				.from("recipeimages")
				.download(path);
			if (error) throw error;

			const url = URL.createObjectURL(data);
			recipeImageUrl = url;
		} catch (error) {
			if (error instanceof Error) {
				console.log("Error downloading image: ", error.message);
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
		await uploadRecipeImage();
	};

	const uploadRecipeImage = async () => {
		try {
			uploading = true;

			if (!croppedFile) throw new Error("no cropped image found.");
			const file = croppedFile;

			const fileExt = file.name.split(".").pop();
			const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
			const filePath = `${userId}/${fileName}`;

			const { error } = await sb.storage
				.from("recipeimages")
				.upload(filePath, file, {
					upsert: true,
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
		<RecipeImageCropper
			{selectedImage}
			on:cropped={(e) => {
				handleCrop(e);
				selectedImage = null;
			}}
			aspectRatio={16 / 9}
		/>
	{:else}
		{#if recipeImageUrl}
			<div class="mb-4">
				<img
					src={recipeImageUrl}
					alt="Recipe preview"
					class="recipe-image"
				/>
			</div>
		{:else}
			<div class="recipe-image-placeholder mb-4">
				<span class="text-slate-500">No image uploaded</span>
			</div>
		{/if}

		<div>
			<label class="upload-button" for="recipe-image-input">
				{uploading ? "Uploading..." : "Upload Recipe Image"}
			</label>
			<input
				style="visibility: hidden; position:absolute;"
				type="file"
				id="recipe-image-input"
				accept="image/*"
				on:change={handleFileSelect}
				disabled={uploading}
			/>
		</div>
	{/if}
</div>

<style>
	.recipe-image {
		width: 100%;
		aspect-ratio: 16 / 9;
		object-fit: cover;
		border-radius: 8px;
		border: 1px solid #e5e7eb;
	}

	.recipe-image-placeholder {
		width: 100%;
		aspect-ratio: 16 / 9;
		background-color: #f3f4f6;
		border: 2px dashed #d1d5db;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.upload-button {
		background: #0f766e;
		color: white;
		padding: 0.6rem 1.2rem;
		border-radius: 8px;
		cursor: pointer;
		text-align: center;
		display: inline-block;
		font-weight: 500;
	}

	.upload-button:hover {
		background: #115e59;
	}
</style>
