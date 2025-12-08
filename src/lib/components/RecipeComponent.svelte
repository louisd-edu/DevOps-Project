<script lang="ts">

    import Avatar from "$lib/components/Avatar.svelte";
    import type {Recipe} from "$lib/types/Recipe";
    import {Chip} from "$lib";
    import Icon from '@iconify/svelte';
    import { getContext, onDestroy } from 'svelte';
    import type { Writable } from 'svelte/store';
    import {prepareImageUrls} from "$lib/components/prepareImageUrls";
    import { goto } from '$app/navigation';

    let { recipe } = $props<{ recipe: Recipe }>();

    let image = $state<string | null>(null);

    $effect(() => {
        prepareImageUrls(recipe.recipeimageurl, "recipeimages").then((url) => {
            image = url;
        });

    });



    type FavCtx = { store: Writable<Set<string>>; toggleFavorite: (id: string | number) => void | Promise<void> };
    type SavedCtx = { store: Writable<Set<string>>; toggleSaved: (id: string | number) => void | Promise<void> };

    const fav = getContext<FavCtx>('favorites');
    const saved = getContext<SavedCtx>('saved');

    let favSet = $state<Set<string>>(new Set());
    let savedSet = $state<Set<string>>(new Set());

    let unsubFav: (() => void) | null = null;
    if (fav) unsubFav = fav.store.subscribe((v) => { favSet = v; });

    let unsubSaved: (() => void) | null = null;
    if (saved) unsubSaved = saved.store.subscribe((v) => { savedSet = v; });

    onDestroy(() => { unsubFav?.(); unsubSaved?.(); });

    const isFavorited = $derived(favSet.has(String(recipe.id)));
    const isSaved = $derived(savedSet.has(String(recipe.id)));

    function handleToggleFavorite(e: MouseEvent) {
        e.stopPropagation();
        fav?.toggleFavorite(recipe.id);
    }
    function handleToggleSaved(e: MouseEvent) {
        e.stopPropagation();
        saved?.toggleSaved(recipe.id);
    }

    function goToRecipe() {
        goto(`/recipe/${recipe.id}`);
    }

    function goToProfile(e: MouseEvent) {
        e.stopPropagation();
        goto(`/user/${recipe.profiles.username}`);
    }


</script>

<div class="bg-gray-200 p-2 rounded-[28px] min-w-fit sm:rounded-[40px] cursor-pointer hover:bg-gray-300 transition-colors" onclick={goToRecipe}>
    <div
        class="w-full rounded-[20px] sm:rounded-[32px] h-44 sm:h-52 md:h-56 bg-center bg-cover bg-no-repeat flex justify-end items-end p-3 gap-2"
        style={image ? `background-image: url('${image}')` : undefined}
        role="img"
        aria-label="recipe image"
    >
        <button
            type="button"
            aria-label={isFavorited ? 'Unlike' : 'Like'}
            class="btn-heart h-10 w-10 rounded-full border border-white/80 bg-black/30 flex items-center justify-center backdrop-blur-[2px] cursor-pointer"
            onclick={handleToggleFavorite}
            title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
            <Icon icon={isFavorited ? 'mdi:heart' : 'mdi:heart-outline'} height="20" style={isFavorited ? 'color:#ef4444' : ''} />
        </button>
        <button
            type="button"
            aria-label={isSaved ? 'Unsave' : 'Save'}
            class="btn-save h-10 w-10 rounded-full border border-white/80 bg-black/30 flex items-center justify-center backdrop-blur-[2px] cursor-pointer"
            onclick={handleToggleSaved}
            title={isSaved ? 'Remove from saved' : 'Save recipe'}
        >
            <Icon icon={isSaved ? 'mdi:bookmark' : 'mdi:bookmark-outline'} height="20" style={isSaved ? 'color: var(--title-green)' : ''} />
        </button>
    </div>
    <div class="p-2 sm:p-4 sm:pt-1 pt-1">
        <div class="mb-2">
            <div class="font-bold text-xl sm:text-2xl text-nowrap leading-snug">{recipe.recipename}</div>

            <div class="text-gray-600 flex flex-wrap gap-2 mt-1">
                <Chip>
                    {recipe.cuisine}
                </Chip>
                <Chip>
                    {recipe.cookingtime}min
                </Chip>
            </div>

        </div>
        <div class="flex items-center gap-2 leading-tight cursor-pointer hover:opacity-75 transition-opacity" onclick={goToProfile}>
            <Avatar url={recipe.profiles.avatar_url} size="h-12 w-12 sm:h-12 sm:w-12" />
            <div>
                <div class="font-medium text-base sm:text-lg">{recipe.profiles.username}</div>
                <div class="text-gray-500 text-sm">Beginner Cook</div>
            </div>
        </div>
    </div>

</div>

<style>
  /* Same green as title bar (#cdea86) */
  :root { --title-green: #cdea86; }

  .btn-heart,
  .btn-save {
    color: white; /* let icons inherit */
    transition: transform 160ms ease, border-color 160ms ease, background-color 160ms ease, color 160ms ease;
  }

  /* Smooth icon animation & glow handled on svg inside Icon Layout */
  :global(.btn-heart svg),
  :global(.btn-save svg) {
    transition: transform 160ms ease, color 160ms ease, filter 160ms ease;
  }

  /* Heart: grow and glow red */
  .btn-heart:hover { color: #ef4444; /* red-500 */ border-color: rgba(239, 68, 68, 0.9); }
  :global(.btn-heart:hover svg) {
    filter: drop-shadow(0 0 8px rgba(239, 68, 68, 0.85));
    transform: scale(1.2);
  }

  /* Bookmark: jump and turn the green */
  @keyframes jump {
    0%, 100% { transform: translateY(0); }
    40% { transform: translateY(-6px); }
    60% { transform: translateY(-2px); }
  }
  .btn-save:hover { color: var(--title-green); border-color: rgba(205, 234, 134, 0.95); }
  :global(.btn-save:hover svg) {
    filter: drop-shadow(0 0 8px rgba(205, 234, 134, 0.95));
    animation: jump 420ms ease-out;
  }
</style>
