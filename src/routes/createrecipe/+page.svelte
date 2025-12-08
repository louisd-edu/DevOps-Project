<script lang="ts">
	import { enhance } from "$app/forms";
	import type { SubmitFunction } from "@sveltejs/kit";
	import { Chip } from "$lib";
	import { getContext, onMount, tick } from "svelte";
	import { supabase as supabaseFallback } from "$lib/supabaseClient";
	import type { SupabaseClient } from "@supabase/supabase-js";
	import type { RecipeIngredient } from "$lib/types/RecipeIngredient";
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

	// Restore form data on error
	$effect(() => {
		if (form?.data) {
			recipeName = form.data.recipeName ?? "";
			cookingTime = form.data.cookingTime ?? null;
			selectedCuisine = form.data.cuisine ?? null;
			recipeImageUrl = form.data.recipeImageUrl ?? undefined;
			methodSteps = form.data.methodSteps ?? [""];
			ingredients = form.data.ingredients ?? [];
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
	const errors = $derived((form?.errors ?? {}) as Record<string, string>);
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
	<h1 class="mb-6 text-3xl font-bold text-neutral-900 dark:text-neutral-50">Create New Recipe</h1>

	{#if form?.message}
		<div
			class="mb-4 rounded border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/30 p-4 text-red-700 dark:text-red-300"
		>
			{form.message}
		</div>
	{/if}

	<form
		method="post"
		action="?/create"
		use:enhance={handleSubmit}
		class="space-y-6"
	>
		<!-- Recipe Image Upload -->
		<div class="rounded-lg bg-neutral-100 dark:bg-neutral-800 p-6 shadow-lg">
			<h2 class="mb-4 text-xl font-semibold text-neutral-900 dark:text-neutral-50">Recipe Image</h2>
			<RecipeImageUpload
				{sb}
				userId={data.session?.user?.id ?? ""}
				bind:url={recipeImageUrl}
			/>
		</div>

		<!-- Basic Information -->
		<div class="rounded-lg bg-neutral-100 dark:bg-neutral-800 p-6 space-y-4 shadow-lg">
			<h2 class="mb-4 text-xl font-semibold text-neutral-900 dark:text-neutral-50">Basic Information</h2>

			<div>
				<label for="recipeName" class="mb-1 block font-medium text-neutral-900 dark:text-neutral-50"
					>Recipe Name <span class="text-red-500 dark:text-red-400">*</span></label
				>
				<input
					id="recipeName"
					name="recipeName"
					type="text"
					bind:value={recipeName}
					required
					minlength="3"
					maxlength="200"
					class="w-full rounded bg-neutral-200 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 px-3 py-2 text-neutral-900 dark:text-neutral-50 placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600"
					placeholder="e.g., Grandma's Chocolate Cake"
				/>
				{#if errors.recipeName}
					<p class="mt-1 text-sm text-red-500 dark:text-red-400">{errors.recipeName}</p>
				{/if}
			</div>

			<div>
				<label for="cookingTime" class="mb-1 block font-medium text-neutral-900 dark:text-neutral-50"
					>Cooking Time (minutes) <span class="text-red-500 dark:text-red-400">*</span></label
				>
				<input
					id="cookingTime"
					name="cookingTime"
					type="number"
					bind:value={cookingTime}
					required
					min="1"
					max="1440"
					class="w-full rounded bg-neutral-200 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 px-3 py-2 text-neutral-900 dark:text-neutral-50 placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600"
					placeholder="e.g., 45"
				/>
				{#if errors.cookingTime}
					<p class="mt-1 text-sm text-red-500 dark:text-red-400">{errors.cookingTime}</p>
				{/if}
			</div>

			<div>
				<div class="flex items-center gap-3 p-3 border border-neutral-300 dark:border-neutral-600 rounded bg-neutral-200 dark:bg-neutral-700">
					<input
						id="isPublic"
						type="checkbox"
						bind:checked={isPublic}
						class="h-5 w-5"
					/>
					<label for="isPublic" class="cursor-pointer mb-0">
						<span class="font-medium text-neutral-900 dark:text-neutral-50">Make this recipe public</span>
						<span class="block text-neutral-600 dark:text-neutral-400 text-sm">
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
		<div class="rounded-lg bg-neutral-100 dark:bg-neutral-800 p-6 space-y-4 shadow-lg">
			<h2 class="text-xl font-semibold text-neutral-900 dark:text-neutral-50">
				Cuisine <span class="text-red-500 dark:text-red-400">*</span>
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
							class="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-neutral-100 dark:from-neutral-800 to-transparent"
						></div>
					{/if}
					{#if showRightFade}
						<div
							class="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-neutral-100 dark:from-neutral-800 to-transparent"
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
				<p class="text-neutral-500 dark:text-neutral-400 text-sm">
					Select a region above to see available cuisines
				</p>
			{:else}
				<p class="text-neutral-500 dark:text-neutral-400 text-sm">
					No cuisines available for this region
				</p>
			{/if}

			{#if errors.cuisine}
				<p class="text-sm text-red-500 dark:text-red-400">{errors.cuisine}</p>
			{/if}
		</div>

		<!-- Method Steps -->
		<div class="rounded-lg bg-neutral-100 dark:bg-neutral-800 p-6 space-y-4 shadow-lg">
			<h2 class="mb-4 text-xl font-semibold text-neutral-900 dark:text-neutral-50">
				Cooking Instructions <span class="text-red-500 dark:text-red-400">*</span>
			</h2>
			<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
			{#each methodSteps as _, index (index)}
				<div class="flex gap-2">
					<div class="flex-shrink-0 pt-2 text-neutral-600 dark:text-neutral-400">
						{index + 1}.
					</div>
					<textarea
						bind:value={methodSteps[index]}
						class="flex-1 rounded bg-neutral-200 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 px-3 py-2 text-neutral-900 dark:text-neutral-50 placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600"
						placeholder="Describe this step..."
						rows="2"
					></textarea>
					{#if methodSteps.length > 1}
						<button
							type="button"
							onclick={() => removeMethodStep(index)}
							class="flex-shrink-0 rounded bg-red-100 dark:bg-red-900/40 px-3 py-2 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/60"
						>
							Remove
						</button>
					{/if}
				</div>
			{/each}
			<button
				type="button"
				onclick={addMethodStep}
				class="rounded bg-neutral-200 dark:bg-neutral-700 px-4 py-2 text-neutral-900 dark:text-neutral-50 hover:bg-neutral-300 dark:hover:bg-neutral-600"
			>
				+ Add Step
			</button>
			{#if errors.method}
				<p class="mt-2 text-sm text-red-500 dark:text-red-400">{errors.method}</p>
			{/if}
		</div>

		<!-- Ingredients List -->
		<div class="rounded-lg bg-neutral-100 dark:bg-neutral-800 p-6 space-y-4 shadow-lg">
			<h2 class="mb-4 text-xl font-semibold text-neutral-900 dark:text-neutral-50">
				Ingredients <span class="text-red-500 dark:text-red-400">*</span>
			</h2>

			{#if ingredients.length > 0}
				<div class="space-y-2">
					{#each ingredients as ingredient, index (index)}
						<div
							class="flex items-center justify-between rounded border border-neutral-300 dark:border-neutral-600 bg-neutral-200 dark:bg-neutral-700 p-3"
						>
							<div class="flex-1">
								<span class="font-medium text-neutral-900 dark:text-neutral-50">{ingredient.name}</span>
								<span class="text-neutral-600 dark:text-neutral-400">
									- {ingredient.quantity}
									{ingredient.unit}
								</span>
								<span class="text-sm text-neutral-500 dark:text-neutral-400 ml-2">
									({Math.round(ingredient.calories * ingredient.quantity)} cal,
									{(ingredient.protein * ingredient.quantity).toFixed(1)}g
									protein)
								</span>
							</div>
							<button
								type="button"
								onclick={() => removeIngredient(index)}
								class="rounded bg-red-100 dark:bg-red-900/40 px-3 py-1 text-sm text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/60"
							>
								Remove
							</button>
						</div>
					{/each}

					<!-- Totals -->
					<div
						class="rounded border-2 border-accent-400 dark:border-accent-600 bg-accent-100 dark:bg-accent-900/30 p-4 font-semibold"
					>
						<div class="flex justify-between text-neutral-900 dark:text-neutral-50">
							<span>Total Nutrition:</span>
							<span>
								{Math.round(totalCalories)} calories, {totalProtein.toFixed(1)}g
								protein
							</span>
						</div>
					</div>
				</div>
			{:else}
				<p class="text-neutral-500 dark:text-neutral-400">
					No ingredients added yet. Click the button below to add ingredients.
				</p>
			{/if}

			<button
				type="button"
				onclick={() => (showIngredientModal = true)}
				class="rounded bg-accent-500 dark:bg-accent-600 px-4 py-2 text-white hover:bg-accent-600 dark:hover:bg-accent-700 shadow-lg"
			>
				+ Add Ingredient
			</button>
			{#if errors.ingredients}
				<p class="mt-2 text-sm text-red-500 dark:text-red-400">{errors.ingredients}</p>
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
				class="rounded bg-primary-500 dark:bg-primary-600 px-6 py-3 font-semibold text-white hover:bg-primary-600 dark:hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50 shadow-lg"
			>
				{loading ? "Creating Recipe..." : "Create Recipe"}
			</button>
			<a
				href="/"
				class="rounded bg-neutral-200 dark:bg-neutral-700 px-6 py-3 font-semibold text-neutral-900 dark:text-neutral-50 hover:bg-neutral-300 dark:hover:bg-neutral-600"
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
		existingIngredients={data.ingredients}
		onAdd={handleIngredientAdd}
	/>
{/if}
