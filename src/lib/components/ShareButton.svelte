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
	class="flex items-center justify-center gap-2 px-3 py-2 min-w-[44px] h-[44px] rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
	class:border={!copied}
	class:border-green-500={copied}
	class:bg-green-500={copied}
	class:text-white={copied}
	class:border-slate-300={!copied}
	class:bg-slate-100={!copied}
	class:hover:bg-slate-200={!copied}
	class:text-slate-700={!copied}
	title={copied ? 'Link copied to clipboard!' : 'Share this recipe'}
>
	{#if copied}
		<Icon icon="mdi:check" height="20" />
		<span class="hidden sm:inline whitespace-nowrap">Copied!</span>
	{:else}
		<Icon icon="mdi:share-variant" height="20" />
		<span class="hidden sm:inline whitespace-nowrap">Share</span>
	{/if}
</button>
