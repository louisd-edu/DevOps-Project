<script lang="ts">
  export let label: string = '';
  export let color: string = ''; // text color (optional)
  export let background: string = ''; // background color (optional)
  export let ariaLabel: string = '';

  // Compose style in script so props are used and recognized by analyzer
  $: styleAttr = color || background ? `${color ? `color: ${color};` : ''} ${background ? `background: ${background};` : ''}` : undefined;
</script>

<button
  type="button"
  class="inline-flex items-center rounded-lg text-sm font-medium whitespace-nowrap bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 hover:opacity-80 transition-opacity"
  style={`padding: 0.5em 1em; ${styleAttr || ''}`}
  aria-label={ariaLabel}
  {...$$restProps}
>
  <slot>{label}</slot>
</button>
