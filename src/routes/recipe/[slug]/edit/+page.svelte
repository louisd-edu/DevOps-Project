<script lang="ts">
	import { enhance } from "$app/forms";
	import type { SubmitFunction } from "@sveltejs/kit";
	import { Chip } from "$lib";
	import { getContext, onMount, tick } from "svelte";
	import { supabase as supabaseFallback } from "$lib/supabaseClient";
	import type { SupabaseClient } from "@supabase/supabase-js";
	import type { RecipeIngredient } from "$lib/types/RecipeIngredient";
	import type { Cuisine } from "$lib/types/Cuisine";
	import RecipeImageUpload from "$lib/components/RecipeImageUpload.svelte";
	import IngredientModal from "$lib/components/IngredientModal.svelte";

	let { data, form } = $props();

	const ctxClient = getContext<SupabaseClient>("supabase");
	const sb = ctxClient ?? supabaseFallback;

	// Form state
	let recipeName = $state("");
	let cookingTime = $state<number | null>(null);
	let selectedCuisine = $state<string | null>(null);
	let selectedArea = $state<string | null>(null);
	let recipeImageUrl = $state<string | undefined>(undefined);
	let methodSteps = $state<string[]>([""]);
	let ingredients = $state<RecipeIngredient[]>([]);
	let isPublic = $state(true);

	// UI state
	let loading = $state(false);
	let showIngredientModal = $state(false);

	// Scroller/fade state for broader areas
	let scroller = $state<HTMLDivElement | null>(null);
	let showLeftFade = $state(false);
	let showRightFade = $state(false);

	// Auto-calculated nutritional totals
	let totalCalories = $derived(
		ingredients.reduce((sum, ing) => sum + ing.calories * ing.quantity, 0)
	);
	let totalProtein = $derived(
		ingredients.reduce((sum, ing) => sum + ing.protein * ing.quantity, 0)
	);

	// Initialize form with existing recipe data
	onMount(() => {
		if (data.recipe) {
			recipeName = data.recipe.recipename ?? "";
			cookingTime = data.recipe.cookingtime ?? null;
			selectedCuisine = data.recipe.cuisine ?? null;
			recipeImageUrl = data.recipe.recipeimageurl ?? undefined;
			methodSteps = data.recipe.method && data.recipe.method.length > 0 ? data.recipe.method : [""];

			// Convert recipe_ingredients to RecipeIngredient format
			if (data.recipe.recipe_ingredients) {
				ingredients = data.recipe.recipe_ingredients.map((ri: { ingredientid: string; quantity: number; type: string; ingredients?: { calories: number; protein: number } }) => ({
					name: ri.ingredientid,
					quantity: ri.quantity,
					unit: ri.type,
					calories: ri.ingredients?.calories ?? 0,
					protein: ri.ingredients?.protein ?? 0,
					isNew: false,
				}));
			}

			// Find the broader area for the selected cuisine
			if (selectedCuisine) {
				const cuisine = data.cuisines?.find((c: Cuisine) => c.name === selectedCuisine);
				if (cuisine && cuisine.broader_areas && cuisine.broader_areas.length > 0) {
					selectedArea = cuisine.broader_areas[0];
				}
			}

			// Initialize privacy setting
			isPublic = data.recipe.is_public ?? true;
		}
	});

	// Form submission handler
	const handleSubmit: SubmitFunction = () => {
		loading = true;

		return async ({ update }) => {
			loading = false;
			await update();
		};
	};

	// Method step handlers
	function addMethodStep() {
		methodSteps = [...methodSteps, ""];
	}

	function removeMethodStep(index: number) {
		if (methodSteps.length > 1) {
			methodSteps = methodSteps.filter((_, i) => i !== index);
		}
	}

	// Ingredient handlers
	function removeIngredient(index: number) {
		ingredients = ingredients.filter((_, i) => i !== index);
	}

	function handleIngredientAdd(ingredient: RecipeIngredient) {
		ingredients = [...ingredients, ingredient];
		showIngredientModal = false;
	}

	// Validation helpers
	const errors = $derived({} as Record<string, string>);
	const isFormValid = $derived(
		recipeName.trim().length >= 3 &&
			cookingTime !== null &&
			cookingTime > 0 &&
			selectedCuisine !== null &&
			methodSteps.filter((s) => s.trim()).length > 0 &&
			ingredients.length > 0
	);

	// Broader areas derived from cuisines
	const allBroaderAreas = $derived(
		Array.from(
			new Set((data.cuisines ?? []).flatMap((c) => c.broader_areas ?? []))
		).sort((a, b) => a.localeCompare(b))
	);

	// Cuisines for selected broader area
	const cuisinesForSelectedArea = $derived(
		selectedArea
			? (data.cuisines ?? [])
					.filter((c) => (c.broader_areas ?? []).includes(selectedArea as string))
					.sort((a, b) => a.name.localeCompare(b.name))
			: []
	);

	// Scroller fade effects
	function updateFades() {
		if (!scroller) {
			showLeftFade = false;
			showRightFade = false;
			return;
		}
		const { scrollLeft, scrollWidth, clientWidth } = scroller;
		showLeftFade = scrollLeft > 0;
		showRightFade = scrollLeft + clientWidth < scrollWidth - 1;
	}

	// Toggle broader area selection
	function toggleBroaderArea(area: string) {
		const nextArea = selectedArea === area ? null : area;
		selectedArea = nextArea;
		selectedCuisine = null; // Clear cuisine when area changes
	}

	// Toggle cuisine selection
	function toggleCuisine(name: string) {
		const next = selectedCuisine === name ? null : name;
		selectedCuisine = next;
	}

	// Initialize scroller
	onMount(() => {
		updateFades();
		requestAnimationFrame(updateFades);
	});

	// Update fades when area changes
	$effect(() => {
		tick().then(() => updateFades());
	});
</script>

<div class="container mx-auto max-w-4xl p-6">
	<h1 class="mb-6 text-3xl font-bold">Edit Recipe</h1>

	{#if form?.message}
		<div
			class="mb-4 rounded border border-red-300 bg-red-50 p-4 text-red-700"
		>
			{form.message}
		</div>
	{/if}

	<form
		method="post"
		action="?/update"
		use:enhance={handleSubmit}
		class="space-y-6"
	>
		<!-- Recipe Image Upload -->
		<div class="rounded-lg border border-slate-300 bg-white p-6">
			<h2 class="mb-4 text-xl font-semibold">Recipe Image</h2>
			<RecipeImageUpload
				{sb}
				userId={data.recipe?.user_id ?? ""}
				bind:url={recipeImageUrl}
			/>
		</div>

		<!-- Basic Information -->
		<div class="rounded-lg border border-slate-300 bg-white p-6 space-y-4">
			<h2 class="mb-4 text-xl font-semibold">Basic Information</h2>

			<div>
				<label for="recipeName" class="mb-1 block font-medium"
					>Recipe Name <span class="text-red-500">*</span></label
				>
				<input
					id="recipeName"
					name="recipeName"
					type="text"
					bind:value={recipeName}
					required
					minlength="3"
					maxlength="200"
					class="w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring focus:ring-slate-200"
					placeholder="e.g., Grandma's Chocolate Cake"
				/>
				{#if errors.recipeName}
					<p class="mt-1 text-sm text-red-500">{errors.recipeName}</p>
				{/if}
			</div>

			<div>
				<label for="cookingTime" class="mb-1 block font-medium"
					>Cooking Time (minutes) <span class="text-red-500">*</span></label
				>
				<input
					id="cookingTime"
					name="cookingTime"
					type="number"
					bind:value={cookingTime}
					required
					min="1"
					max="1440"
					class="w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring focus:ring-slate-200"
					placeholder="e.g., 45"
				/>
				{#if errors.cookingTime}
					<p class="mt-1 text-sm text-red-500">{errors.cookingTime}</p>
				{/if}
			</div>

			<div>
				<div class="flex items-center gap-3 p-3 border border-slate-300 rounded bg-slate-50">
					<input
						id="isPublic"
						type="checkbox"
						bind:checked={isPublic}
						class="h-5 w-5"
					/>
					<label for="isPublic" class="cursor-pointer mb-0">
						<span class="font-medium">Make this recipe public</span>
						<span class="block text-slate-600 text-sm">
							{#if isPublic}
								Anyone can discover and view this recipe
							{:else}
								Only people with a share link can view this recipe
							{/if}
						</span>
					</label>
				</div>
			</div>

			<!-- Hidden field for form submission -->
			<input type="hidden" name="isPublic" value={isPublic} />
		</div>

		<!-- Cuisine Selection -->
		<div class="rounded-lg border border-slate-300 bg-white p-6 space-y-4">
			<h2 class="text-xl font-semibold">
				Cuisine <span class="text-red-500">*</span>
			</h2>

			<!-- Broader Areas (Scrollable) -->
			{#if allBroaderAreas.length}
				<div class="relative -mb-2">
					<div
						class="flex overflow-x-auto items-center gap-2 pb-2 pr-6"
						style="scrollbar-gutter: stable both-edges;"
						bind:this={scroller}
						onscroll={updateFades}
					>
						{#each allBroaderAreas as area (area)}
							<Chip
								background={selectedArea === area ? "#111827" : "#e5e7eb"}
								color={selectedArea === area ? "#fff" : "#111827"}
								ariaLabel={`Select ${area} region`}
								onclick={() => toggleBroaderArea(area)}
							>
								{area}
							</Chip>
						{/each}
					</div>
					{#if showLeftFade}
						<div
							class="pointer-events-none absolute left-0 top-0 h-full w-10"
							style="background: linear-gradient(to right, rgba(255,255,255,1), rgba(255,255,255,0));"
						></div>
					{/if}
					{#if showRightFade}
						<div
							class="pointer-events-none absolute right-0 top-0 h-full w-10"
							style="background: linear-gradient(to left, rgba(255,255,255,1), rgba(255,255,255,0));"
						></div>
					{/if}
				</div>
			{/if}

			<!-- Cuisines for Selected Area (Wrapped) -->
			{#if cuisinesForSelectedArea.length}
				<div class="flex flex-wrap items-center gap-2">
					{#each cuisinesForSelectedArea as cuisine (cuisine.name)}
						<Chip
							background={selectedCuisine === cuisine.name
								? "#0f766e"
								: "#d1fae5"}
							color={selectedCuisine === cuisine.name ? "#fff" : "#064e3b"}
							ariaLabel={`Select ${cuisine.name} cuisine`}
							onclick={() => toggleCuisine(cuisine.name)}
						>
							{cuisine.name}
						</Chip>
					{/each}
				</div>
			{:else if !selectedArea}
				<p class="text-slate-500 text-sm">
					Select a region above to see available cuisines
				</p>
			{:else}
				<p class="text-slate-500 text-sm">
					No cuisines available for this region
				</p>
			{/if}

			{#if errors.cuisine}
				<p class="text-sm text-red-500">{errors.cuisine}</p>
			{/if}
		</div>

		<!-- Method Steps -->
		<div class="rounded-lg border border-slate-300 bg-white p-6 space-y-4">
			<h2 class="mb-4 text-xl font-semibold">
				Cooking Instructions <span class="text-red-500">*</span>
			</h2>
			<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
			{#each methodSteps as _, index (index)}
				<div class="flex gap-2">
					<div class="flex-shrink-0 pt-2 text-slate-500">
						{index + 1}.
					</div>
					<textarea
						bind:value={methodSteps[index]}
						class="flex-1 rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring focus:ring-slate-200"
						placeholder="Describe this step..."
						rows="2"
					></textarea>
					{#if methodSteps.length > 1}
						<button
							type="button"
							onclick={() => removeMethodStep(index)}
							class="flex-shrink-0 rounded bg-red-100 px-3 py-2 text-red-700 hover:bg-red-200"
						>
							Remove
						</button>
					{/if}
				</div>
			{/each}
			<button
				type="button"
				onclick={addMethodStep}
				class="rounded bg-slate-200 px-4 py-2 hover:bg-slate-300"
			>
				+ Add Step
			</button>
			{#if errors.method}
				<p class="mt-2 text-sm text-red-500">{errors.method}</p>
			{/if}
		</div>

		<!-- Ingredients List -->
		<div class="rounded-lg border border-slate-300 bg-white p-6 space-y-4">
			<h2 class="mb-4 text-xl font-semibold">
				Ingredients <span class="text-red-500">*</span>
			</h2>

			{#if ingredients.length > 0}
				<div class="space-y-2">
					{#each ingredients as ingredient, index (index)}
						<div
							class="flex items-center justify-between rounded border border-slate-200 bg-slate-50 p-3"
						>
							<div class="flex-1">
								<span class="font-medium">{ingredient.name}</span>
								<span class="text-slate-600">
									- {ingredient.quantity}
									{ingredient.unit}
								</span>
								<span class="text-sm text-slate-500 ml-2">
									({Math.round(ingredient.calories * ingredient.quantity)} cal,
									{(ingredient.protein * ingredient.quantity).toFixed(1)}g
									protein)
								</span>
							</div>
							<button
								type="button"
								onclick={() => removeIngredient(index)}
								class="rounded bg-red-100 px-3 py-1 text-sm text-red-700 hover:bg-red-200"
							>
								Remove
							</button>
						</div>
					{/each}

					<!-- Totals -->
					<div
						class="rounded border-2 border-teal-300 bg-teal-50 p-4 font-semibold"
					>
						<div class="flex justify-between">
							<span>Total Nutrition:</span>
							<span>
								{Math.round(totalCalories)} calories, {totalProtein.toFixed(1)}g
								protein
							</span>
						</div>
					</div>
				</div>
			{:else}
				<p class="text-slate-500">
					No ingredients added yet. Click the button below to add ingredients.
				</p>
			{/if}

			<button
				type="button"
				onclick={() => (showIngredientModal = true)}
				class="rounded bg-teal-600 px-4 py-2 text-white hover:bg-teal-700"
			>
				+ Add Ingredient
			</button>
			{#if errors.ingredients}
				<p class="mt-2 text-sm text-red-500">{errors.ingredients}</p>
			{/if}
		</div>

		<!-- Hidden Fields for Submission -->
		<input type="hidden" name="cuisine" value={selectedCuisine ?? ""} />
		<input type="hidden" name="recipeImageUrl" value={recipeImageUrl ?? ""} />
		<input type="hidden" name="methodSteps" value={JSON.stringify(methodSteps)} />
		<input
			type="hidden"
			name="ingredients"
			value={JSON.stringify(ingredients)}
		/>

		<!-- Submit Button -->
		<div class="flex gap-4">
			<button
				type="submit"
				disabled={loading || !isFormValid}
				class="rounded bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{loading ? "Updating Recipe..." : "Update Recipe"}
			</button>
			<a
				href="/"
				class="rounded bg-slate-200 px-6 py-3 font-semibold hover:bg-slate-300"
			>
				Cancel
			</a>
		</div>
	</form>
</div>

<!-- Ingredient Modal -->
{#if showIngredientModal}
	<IngredientModal
		bind:open={showIngredientModal}
		existingIngredients={data.existingIngredients}
		onAdd={handleIngredientAdd}
	/>
{/if}
