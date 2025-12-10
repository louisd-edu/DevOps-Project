<script lang="ts">
    import { prepareImageUrls } from "$lib/components/prepareImageUrls";
    import { generateAvatar } from "$lib/utils/generateAvatar";

    interface Props {
        url: string | null;
        seed?: string;
        size?: string;
        class?: string;
    }
    let { url = $bindable(), seed = "default", size = "w-10 h-10", class: className = "" }: Props = $props()

    let avatar = $state<string | null>(null);

    $effect(() => {
        if (url) {
            prepareImageUrls(url, "avatars").then((preparedUrl) => {
                avatar = preparedUrl;
            });
        } else {
            avatar = generateAvatar(seed);
        }
    });
</script>

<img src={avatar} alt="avatar" class="rounded-full object-cover {size} {className}" />