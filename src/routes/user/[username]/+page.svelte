<script lang="ts">
import RecipeComponent from "$lib/components/RecipeComponent.svelte";
import RecipeInteractionProvider from "$lib/components/RecipeInteractionProvider.svelte";
import { supabase } from "$lib/supabaseClient";
import type { Recipe } from "$lib/types/Recipe";

let { data } = $props<{ data: { myrecipes: Recipe[] } }>();
</script>

<RecipeInteractionProvider supabase={supabase} userId={data.user?.id ?? null}>
	{#each data.myrecipes as recipe (recipe.id)}
		<RecipeComponent {recipe} />
	{/each}
</RecipeInteractionProvider>
