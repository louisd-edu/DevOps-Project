<script lang="ts">
	import type { Ingredient, MeasurementUnit } from "$lib/types/Ingredient";
	import type { RecipeIngredient } from "$lib/types/RecipeIngredient";

	interface Props {
		open?: boolean;
		existingIngredients: Ingredient[];
		onAdd: (ingredient: RecipeIngredient) => void;
	}

	let { open = $bindable(), existingIngredients, onAdd }: Props = $props();

	// Search and selection state
	let searchQuery = $state("");
	let selectedIngredient = $state<Ingredient | null>(null);
	let isAddingNew = $state(false);

	// Quantity/unit state
	let quantity = $state<number>(1);
	let unit = $state<MeasurementUnit>("g");

	// New ingredient state
	let newIngredientName = $state("");
	let newCalories = $state<number>(0);
	let newProtein = $state<number>(0);

	// Available units (matches database enum)
	const UNITS: MeasurementUnit[] = [
		"g",
		"kg",
		"ml",
		"l",
		"cup",
		"tbsp",
		"tsp",
		"oz",
		"lb",
		"piece",
		"clove",
		"pinch",
		"handful",
		"slice",
		"can",
		"bunch",
	];

	// Filtered search results
	let filteredIngredients = $derived(
		existingIngredients
			.filter((ing) =>
				ing.name.toLowerCase().includes(searchQuery.toLowerCase())
			)
			.slice(0, 10)
	);

	// Calculate total nutrition based on quantity
	let totalCalories = $derived(
		selectedIngredient
			? selectedIngredient.calories * quantity
			: isAddingNew
				? newCalories
				: 0
	);

	let totalProtein = $derived(
		selectedIngredient
			? selectedIngredient.protein * quantity
			: isAddingNew
				? newProtein
				: 0
	);

	function selectIngredient(ingredient: Ingredient) {
		selectedIngredient = ingredient;
		searchQuery = ingredient.name;
		unit = ingredient.unit; // Auto-set unit from ingredient
		isAddingNew = false;
	}

	function toggleAddNew() {
		isAddingNew = !isAddingNew;
		selectedIngredient = null;
		if (isAddingNew) {
			searchQuery = "";
			newIngredientName = "";
			newCalories = 0;
			newProtein = 0;
		}
	}

	function handleAdd() {
		// Validation
		if (!quantity || quantity <= 0) {
			alert("Please enter a valid quantity");
			return;
		}

		if (isAddingNew) {
			// Adding new ingredient
			if (!newIngredientName.trim()) {
				alert("Please enter ingredient name");
				return;
			}
			if (newCalories < 0 || newProtein < 0) {
				alert("Nutritional values cannot be negative");
				return;
			}

			const newIngredient: RecipeIngredient = {
				name: newIngredientName.trim(),
				quantity,
				unit,
				calories: newCalories,
				protein: newProtein,
				isNew: true,
			};

			onAdd(newIngredient);
		} else if (selectedIngredient) {
			// Adding existing ingredient
			const ingredient: RecipeIngredient = {
				name: selectedIngredient.name,
				quantity,
				unit,
				calories: selectedIngredient.calories,
				protein: selectedIngredient.protein,
				isNew: false,
			};

			onAdd(ingredient);
		} else {
			alert("Please select an ingredient or add a new one");
			return;
		}

		// Reset state
		resetState();
	}

	function resetState() {
		searchQuery = "";
		selectedIngredient = null;
		isAddingNew = false;
		quantity = 1;
		unit = "g";
		newIngredientName = "";
		newCalories = 0;
		newProtein = 0;
	}

	function closeModal() {
		open = false;
		resetState();
	}
</script>

{#if open}
	<!-- Modal Overlay -->
	<div
		class="modal-overlay"
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		onclick={closeModal}
		onkeydown={(e) => e.key === "Escape" && closeModal()}
	>
		<!-- Modal Content -->
		<div class="modal-content" role="presentation" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Add Ingredient</h2>
				<button
					type="button"
					class="close-button"
					onclick={closeModal}
					aria-label="Close modal"
				>
					×
				</button>
			</div>

			<div class="modal-body">
				<!-- Mode Toggle -->
				<div class="mb-4 flex gap-2">
					<button
						type="button"
						class="mode-button {!isAddingNew ? 'active' : ''}"
						onclick={() => {
							isAddingNew = false;
							selectedIngredient = null;
						}}
					>
						Select Existing
					</button>
					<button
						type="button"
						class="mode-button {isAddingNew ? 'active' : ''}"
						onclick={toggleAddNew}
					>
						Add New Ingredient
					</button>
				</div>

				{#if !isAddingNew}
					<!-- Search Existing Ingredients -->
					<div class="mb-4">
						<label for="ingredient-search" class="mb-1 block font-medium text-neutral-900 dark:text-neutral-50"
							>Search Ingredients</label
						>
						<input
							id="ingredient-search"
							type="text"
							bind:value={searchQuery}
							placeholder="Type to search..."
							class="w-full rounded bg-neutral-200 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 px-3 py-2 text-neutral-900 dark:text-neutral-50 placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600"
						/>
					</div>

					<!-- Search Results -->
					{#if searchQuery}
						<div class="mb-4 max-h-48 overflow-y-auto">
							{#if filteredIngredients.length > 0}
								<div class="space-y-2">
									{#each filteredIngredients as ingredient (ingredient.name)}
										<button
											type="button"
											class="result-item {selectedIngredient?.name === ingredient.name ? 'selected' : ''}"
											onclick={() => selectIngredient(ingredient)}
										>
											<div class="flex items-center justify-between">
												<div class="flex-1">
													<div class="font-medium text-neutral-900 dark:text-neutral-50">{ingredient.name}</div>
													<div class="text-sm text-neutral-500 dark:text-neutral-400">
														Per {ingredient.unit}: {ingredient.calories} cal, {ingredient.protein}g
														protein
													</div>
												</div>
												{#if selectedIngredient?.name === ingredient.name}
													<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-accent-600 dark:text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
													</svg>
												{/if}
											</div>
										</button>
									{/each}
								</div>
							{:else}
								<p class="text-neutral-500 dark:text-neutral-400">
									No ingredients found. Try adding a new one!
								</p>
							{/if}
						</div>
					{/if}
				{:else}
					<!-- Add New Ingredient Form -->
					<div class="space-y-4 mb-4">
						<div>
							<label for="new-ingredient-name" class="mb-1 block font-medium text-neutral-900 dark:text-neutral-50"
								>Ingredient Name <span class="text-red-500">*</span></label
							>
							<input
								id="new-ingredient-name"
								type="text"
								bind:value={newIngredientName}
								placeholder="e.g., Chicken Breast"
								class="w-full rounded bg-neutral-200 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 px-3 py-2 text-neutral-900 dark:text-neutral-50 placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600"
							/>
						</div>

						<div>
							<label for="new-unit" class="mb-1 block font-medium text-neutral-900 dark:text-neutral-50"
								>Unit <span class="text-red-500">*</span></label
							>
							<select
								id="new-unit"
								bind:value={unit}
								class="w-full rounded bg-neutral-200 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 px-3 py-2 text-neutral-900 dark:text-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600"
							>
								{#each UNITS as unitOption (unitOption)}
									<option value={unitOption}>{unitOption}</option>
								{/each}
							</select>
							<p class="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
								Choose the standard unit for measuring this ingredient
							</p>
						</div>

						<div class="grid grid-cols-2 gap-4">
							<div>
								<label for="new-calories" class="mb-1 block font-medium text-neutral-900 dark:text-neutral-50"
									>Calories (per {unit}) <span class="text-red-500">*</span
									></label
								>
								<input
									id="new-calories"
									type="number"
									bind:value={newCalories}
									min="0"
									step="0.1"
									placeholder="165"
									class="w-full rounded bg-neutral-200 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 px-3 py-2 text-neutral-900 dark:text-neutral-50 placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600"
								/>
							</div>

							<div>
								<label for="new-protein" class="mb-1 block font-medium text-neutral-900 dark:text-neutral-50"
									>Protein (g per {unit}) <span class="text-red-500">*</span
									></label
								>
								<input
									id="new-protein"
									type="number"
									bind:value={newProtein}
									min="0"
									step="0.1"
									placeholder="31"
									class="w-full rounded bg-neutral-200 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 px-3 py-2 text-neutral-900 dark:text-neutral-50 placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600"
								/>
							</div>
						</div>
					</div>
				{/if}

				<!-- Quantity (Always visible when ingredient selected or adding new) -->
				{#if selectedIngredient || isAddingNew}
					<div class="mb-4">
						<label for="quantity" class="mb-1 block font-medium text-neutral-900 dark:text-neutral-50"
							>Quantity ({unit}) <span class="text-red-500">*</span></label
						>
						<input
							id="quantity"
							type="number"
							bind:value={quantity}
							min="0.1"
							step="0.1"
							placeholder="e.g., 250"
							class="w-full rounded bg-neutral-200 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 px-3 py-2 text-neutral-900 dark:text-neutral-50 placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600"
						/>
					</div>

					<!-- Nutrition Preview -->
					<div class="rounded border border-primary-300 dark:border-primary-700 bg-primary-50 dark:bg-primary-900/30 p-3 mb-4">
						<div class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
							Total for this quantity:
						</div>
						<div class="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
							{Math.round(totalCalories)} calories, {totalProtein.toFixed(1)}g
							protein
						</div>
					</div>
				{/if}
			</div>

			<!-- Modal Footer -->
			<div class="modal-footer">
				<button type="button" class="cancel-button" onclick={closeModal}>
					Cancel
				</button>
				<button
					type="button"
					class="add-button"
					onclick={handleAdd}
					disabled={!selectedIngredient && !isAddingNew}
				>
					Add Ingredient
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.7);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 1rem;
	}

	.modal-content {
		background: rgb(var(--color-neutral-100));
		outline: 2px solid white;
		border-radius: 12px;
		max-width: 600px;
		width: 100%;
		max-height: 90vh;
		display: flex;
		flex-direction: column;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
			0 10px 10px -5px rgba(0, 0, 0, 0.04);
	}

	@media (prefers-color-scheme: dark) {
		.modal-content {
			background: rgb(var(--color-neutral-800));
			outline-color: white;
		}
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem;
		border-bottom: 1px solid rgb(var(--color-neutral-300));
	}

	@media (prefers-color-scheme: dark) {
		.modal-header {
			border-bottom-color: rgb(var(--color-neutral-600));
		}
	}

	.close-button {
		background: none;
		border: none;
		font-size: 2rem;
		line-height: 1;
		cursor: pointer;
		color: rgb(var(--color-neutral-500));
		padding: 0;
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: color 0.2s;
	}

	.close-button:hover {
		color: rgb(var(--color-neutral-900));
	}

	@media (prefers-color-scheme: dark) {
		.close-button:hover {
			color: rgb(var(--color-neutral-50));
		}
	}

	.modal-body {
		padding: 1.5rem;
		overflow-y: auto;
		flex: 1;
	}

	.modal-footer {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
		padding: 1.5rem;
		border-top: 1px solid rgb(var(--color-neutral-300));
	}

	@media (prefers-color-scheme: dark) {
		.modal-footer {
			border-top-color: rgb(var(--color-neutral-600));
		}
	}

	.mode-button {
		flex: 1;
		padding: 0.5rem 1rem;
		border: 2px solid rgb(var(--color-neutral-300));
		background: rgba(0, 0, 0, 0.9);
		color: white;
		border-radius: 8px;
		cursor: pointer;
		font-weight: 500;
		transition: all 0.2s;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
	}

	@media (prefers-color-scheme: dark) {
		.mode-button {
			background: rgba(0, 0, 0, 0.9);
			color: white;
			border-color: rgb(var(--color-neutral-500));
		}
	}

	.mode-button.active {
		background: rgba(255, 255, 255, 0.95);
		color: rgba(0, 0, 0, 0.9);
		border-color: rgba(255, 255, 255, 0.95);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
	}

	@media (prefers-color-scheme: dark) {
		.mode-button.active {
			background: rgba(255, 255, 255, 0.95);
			color: rgba(0, 0, 0, 0.9);
			border-color: rgba(255, 255, 255, 0.95);
		}
	}

	.mode-button:hover:not(.active) {
		border-color: rgb(var(--color-accent-500));
		color: rgb(var(--color-accent-600));
	}

	@media (prefers-color-scheme: dark) {
		.mode-button:hover:not(.active) {
			border-color: rgb(var(--color-accent-600));
			color: rgb(var(--color-accent-500));
		}
	}

	.result-item {
		width: 100%;
		text-align: left;
		padding: 1rem;
		border: 2px solid rgb(var(--color-neutral-300));
		border-radius: 8px;
		background: rgb(var(--color-neutral-100));
		cursor: pointer;
		transition: all 0.2s ease;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	@media (prefers-color-scheme: dark) {
		.result-item {
			border-color: rgb(var(--color-neutral-600));
			background: rgb(var(--color-neutral-700));
			box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
		}
	}

	.result-item:hover:not(.selected) {
		border-color: rgb(var(--color-accent-500));
		background: rgb(var(--color-accent-50));
		box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
		transform: translateY(-2px);
	}

	@media (prefers-color-scheme: dark) {
		.result-item:hover:not(.selected) {
			border-color: rgb(var(--color-accent-400));
			background: rgb(var(--color-neutral-600));
			box-shadow: 0 3px 8px rgba(0, 0, 0, 0.4);
		}
	}

	.result-item.selected {
		border-color: rgb(var(--color-accent-500));
		background: rgb(var(--color-accent-100));
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
	}

	@media (prefers-color-scheme: dark) {
		.result-item.selected {
			border-color: rgb(var(--color-accent-400));
			background: rgb(var(--color-accent-900));
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
		}
	}

	.cancel-button {
		padding: 0.6rem 1.2rem;
		border: 1px solid rgb(var(--color-neutral-300));
		background: rgb(var(--color-neutral-200));
		color: rgb(var(--color-neutral-900));
		border-radius: 8px;
		cursor: pointer;
		font-weight: 500;
		transition: background-color 0.2s;
	}

	@media (prefers-color-scheme: dark) {
		.cancel-button {
			background: rgb(var(--color-neutral-700));
			color: rgb(var(--color-neutral-50));
			border-color: rgb(var(--color-neutral-600));
		}
	}

	.cancel-button:hover {
		background: rgb(var(--color-neutral-300));
	}

	@media (prefers-color-scheme: dark) {
		.cancel-button:hover {
			background: rgb(var(--color-neutral-600));
		}
	}

	.add-button {
		padding: 0.6rem 1.2rem;
		background: rgb(var(--color-accent-500));
		color: white;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		font-weight: 500;
		transition: background-color 0.2s;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
	}

	@media (prefers-color-scheme: dark) {
		.add-button {
			background: rgb(var(--color-accent-600));
		}
	}

	.add-button:hover:not(:disabled) {
		background: rgb(var(--color-accent-600));
	}

	@media (prefers-color-scheme: dark) {
		.add-button:hover:not(:disabled) {
			background: rgb(var(--color-accent-700));
		}
	}

	.add-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
