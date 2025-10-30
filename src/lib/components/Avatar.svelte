<script lang="ts">

    import {prepareImageUrls} from "$lib/components/prepareImageUrls";

    interface Props{
        url: string | null;
        size?: string;
        class?: string;
    }
    let { url = $bindable(), size = "w-10 h-10", class: className = "" }: Props = $props()

    let avatar = $state<string | null>(null);

    $effect(() => {
        prepareImageUrls(url, "avatars").then((url) => {
            avatar = url;
        });
    });

</script>


<img src={avatar} alt="avatar" class="rounded-full object-cover {size} {className}" />