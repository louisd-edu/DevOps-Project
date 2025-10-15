<script lang="ts">

    interface Props{
        url: string | null;
        size?: string;
        class?: string;
    }
    let { url = $bindable(), size = "w-10 h-10", class: className = "" }: Props = $props()

</script>


<img src={url} alt="avatar" class="rounded-full object-cover {size} {className}" />