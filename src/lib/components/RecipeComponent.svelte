<script lang="ts">

    import Avatar from "$lib/components/Avatar.svelte";
    import type {Recipe} from "$lib/types/Recipe";
    import {Chip} from "$lib";
    import Icon from '@iconify/svelte';
    import { getContext, onDestroy } from 'svelte';
    import type { Writable } from 'svelte/store';

    let { recipe } = $props<{ recipe: Recipe }>();

    type FavCtx = { store: Writable<Set<string>>; toggleFavorite: (id: string | number) => void | Promise<void> };
    const fav = getContext<FavCtx>('favorites');

    let favSet = $state<Set<string>>(new Set());
    let unsub: (() => void) | null = null;
    if (fav) {
        unsub = fav.store.subscribe((v) => { favSet = v; });
    }
    onDestroy(() => { unsub?.(); });

    const isFavorited = $derived(favSet.has(String(recipe.id)));

    function handleToggleFavorite() {
        fav?.toggleFavorite(recipe.id);
    }

</script>

<div class="bg-gray-200 p-2 rounded-[28px] sm:rounded-[40px]">
    <div
        class="w-full rounded-[20px] sm:rounded-[32px] h-44 sm:h-52 md:h-56 bg-center bg-cover bg-no-repeat flex justify-end items-end p-3 gap-2"
        style={recipe.recipeImage ? `background-image: url('${recipe.recipeImage}')` : undefined}
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
        <button type="button" aria-label="Save" class="btn-save h-10 w-10 rounded-full border border-white/80 bg-black/30 flex items-center justify-center backdrop-blur-[2px] cursor-pointer">
            <Icon icon="mdi:bookmark" height="20" />
        </button>
    </div>
    <div class="p-2 sm:p-4 sm:pt-1 pt-1">
        <div class="mb-2">
            <div class="font-bold text-xl sm:text-2xl break-words leading-snug">{recipe.recipename}</div>

            <div class="text-gray-600 flex flex-wrap gap-2 mt-1">
                <Chip>
                    {recipe.cuisine}
                </Chip>
                <Chip>
                    {recipe.cookingtime}min
                </Chip>
            </div>

        </div>
        <div class="flex items-center gap-2 leading-tight">
            <Avatar url={recipe.profileAvatar} size="h-12 w-12 sm:h-12 sm:w-12" />
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

  /* Smooth icon animation & glow handled on svg inside Icon component */
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
