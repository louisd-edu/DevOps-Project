<script lang="ts">

    import Avatar from "$lib/components/Avatar.svelte";
    import type {Recipe} from "$lib/types/Recipe";
    import {Chip} from "$lib";

    export let recipe: Recipe;

</script>

<div class="bg-gray-200 p-2 rounded-[56px] min-w-[200px] ">
    <img src={recipe.recipeImage} alt="recipeimage" class="w-full object-cover rounded-[48px] h-52"/>
    <div class="p-5 pt-1">
        <div class="mb-2 mt-2">
            <div class="font-bold text-2xl text-nowrap">{recipe.recipename}</div>

            <div class="text-gray-600 flex space-x-2">
                <Chip>
                    {recipe.cuisine}
                </Chip>
                <Chip>
                    {recipe.cookingtime}min
                </Chip>
            </div>

        </div>
        <div class="flex items-center space-x-2 leading-tight">
            <Avatar url={recipe.profileAvatar} size="h-14 w-14" />
            <div>
                <div class="font-medium">{recipe.profiles.username}</div>
                <div class="text-gray-500">Beginner Cook</div>
            </div>
        </div>
    </div>

</div>