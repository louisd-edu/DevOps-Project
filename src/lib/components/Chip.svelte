<script lang="ts">
  export let label: string = '';
  export let color: string = '#333'; // text color
  export let background: string = '#e0e0e0'; // background color
  export let ariaLabel: string = '';
</script>

<span
  class="chip bg-gray-300 p-0 px-2 rounded-full"

  aria-label={ariaLabel}
  role="status"
>
  <slot>{label}</slot>
</span>
