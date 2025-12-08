<script lang="ts">
	let { isPublic }: { isPublic: boolean } = $props();
</script>

<div
	class="absolute top-2 left-2 px-3 py-1 rounded-full text-xs font-semibold shadow-sm backdrop-blur-sm text-white"
	class:bg-green-500={isPublic}
	class:bg-slate-700={!isPublic}
>
	{isPublic ? 'Public' : 'Private'}
</div>
