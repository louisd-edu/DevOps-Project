<script lang="ts">

    import Avatar from "$lib/components/Avatar.svelte";
    import type {Recipe} from "$lib/types/Recipe";
    import {Chip} from "$lib";

    export let recipe: Recipe;

</script>

<div class="bg-gray-200 p-2 rounded-[28px] sm:rounded-[40px]">
    <img src={recipe.recipeImage} alt="recipeimage" class="w-full object-cover rounded-[20px] sm:rounded-[28px] h-44 sm:h-52 md:h-56"/>
    <div class="p-4 sm:p-5 pt-1">
        <div class="mb-2 mt-2">
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
            <Avatar url={recipe.profileAvatar} size="h-12 w-12 sm:h-14 sm:w-14" />
            <div>
                <div class="font-medium text-base sm:text-lg">{recipe.profiles.username}</div>
                <div class="text-gray-500 text-sm">Beginner Cook</div>
            </div>
        </div>
    </div>

</div>