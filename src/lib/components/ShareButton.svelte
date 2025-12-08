<script lang="ts">
	import Icon from '@iconify/svelte';

	let {
		recipeId,
		isPublic,
		shareToken
	}: {
		recipeId: string | number;
		isPublic: boolean;
		shareToken: string | null;
	} = $props();

	let copied = $state(false);
	let copyTimeout: NodeJS.Timeout | null = null;

	function getShareUrl(): string {
		const baseUrl = window.location.origin;
		if (isPublic) {
			return `${baseUrl}/recipe/${recipeId}`;
		} else {
			return `${baseUrl}/recipe/${recipeId}?token=${shareToken}`;
		}
	}

	async function copyToClipboard() {
		const url = getShareUrl();
		await navigator.clipboard.writeText(url);
		copied = true;

		if (copyTimeout) clearTimeout(copyTimeout);
		copyTimeout = setTimeout(() => {
			copied = false;
		}, 2000);
	}
</script>

<button
	type="button"
	onclick={copyToClipboard}
	class="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors"
	class:border-green-500={copied}
	class:bg-green-50={copied}
	class:border-slate-300={!copied}
	class:bg-white={!copied}
	class:hover:bg-slate-50={!copied}
>
	{#if copied}
		<Icon icon="mdi:check" height="20" style="color: #10b981" />
		<span class="text-green-600 font-medium">Link Copied!</span>
	{:else}
		<Icon icon="mdi:share-variant" height="20" />
		<span>Share Recipe</span>
	{/if}
</button>
