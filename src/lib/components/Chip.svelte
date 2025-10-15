<script lang="ts">
  export let label: string = '';
  export let color: string = '#333'; // text color
  export let background: string = '#e0e0e0'; // background color
  export let ariaLabel: string = '';

  // Compose style in script so props are used and recognized by analyzer
  $: styleAttr = `color: ${color}; background: ${background};`;
</script>

<button
  type="button"
  class="rounded-full px-3 py-1 text-sm font-medium whitespace-nowrap items-center gap-1 border border-transparent hover:opacity-90 transition"
  style={styleAttr}
  aria-label={ariaLabel}
  {...$$restProps}
>
  <slot>{label}</slot>
</button>
