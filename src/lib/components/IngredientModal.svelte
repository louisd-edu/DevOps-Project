<script lang="ts">
	import type { Ingredient } from "$lib/types/Ingredient";
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
	let unit = $state("g");

	// New ingredient state
	let newIngredientName = $state("");
	let newCalories = $state<number>(0);
	let newProtein = $state<number>(0);

	// Available units
	const UNITS = [
		"g",
		"ml",
		"cup",
		"tbsp",
		"tsp",
		"oz",
		"lb",
		"piece",
		"clove",
		"pinch",
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
		on:click={closeModal}
		on:keydown={(e) => e.key === "Escape" && closeModal()}
	>
		<!-- Modal Content -->
		<div class="modal-content" on:click|stopPropagation>
			<div class="modal-header">
				<h2 class="text-2xl font-bold">Add Ingredient</h2>
				<button
					type="button"
					class="close-button"
					on:click={closeModal}
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
						on:click={() => {
							isAddingNew = false;
							selectedIngredient = null;
						}}
					>
						Select Existing
					</button>
					<button
						type="button"
						class="mode-button {isAddingNew ? 'active' : ''}"
						on:click={toggleAddNew}
					>
						Add New Ingredient
					</button>
				</div>

				{#if !isAddingNew}
					<!-- Search Existing Ingredients -->
					<div class="mb-4">
						<label for="ingredient-search" class="mb-1 block font-medium"
							>Search Ingredients</label
						>
						<input
							id="ingredient-search"
							type="text"
							bind:value={searchQuery}
							placeholder="Type to search..."
							class="w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring focus:ring-teal-200"
						/>
					</div>

					<!-- Search Results -->
					{#if searchQuery && !selectedIngredient}
						<div class="mb-4 max-h-48 overflow-y-auto">
							{#if filteredIngredients.length > 0}
								<div class="space-y-1">
									{#each filteredIngredients as ingredient (ingredient.name)}
										<button
											type="button"
											class="result-item"
											on:click={() => selectIngredient(ingredient)}
										>
											<div class="font-medium">{ingredient.name}</div>
											<div class="text-sm text-slate-500">
												Per {ingredient.unit}: {ingredient.calories} cal, {ingredient.protein}g
												protein
											</div>
										</button>
									{/each}
								</div>
							{:else}
								<p class="text-slate-500">
									No ingredients found. Try adding a new one!
								</p>
							{/if}
						</div>
					{/if}

					<!-- Selected Ingredient Display -->
					{#if selectedIngredient}
						<div
							class="mb-4 rounded border border-teal-300 bg-teal-50 p-3"
						>
							<div class="font-semibold">{selectedIngredient.name}</div>
							<div class="text-sm text-slate-600">
								Per {selectedIngredient.unit}: {selectedIngredient.calories} cal, {selectedIngredient.protein}g
								protein
							</div>
						</div>
					{/if}
				{:else}
					<!-- Add New Ingredient Form -->
					<div class="space-y-4 mb-4">
						<div>
							<label for="new-ingredient-name" class="mb-1 block font-medium"
								>Ingredient Name <span class="text-red-500">*</span></label
							>
							<input
								id="new-ingredient-name"
								type="text"
								bind:value={newIngredientName}
								placeholder="e.g., Chicken Breast"
								class="w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring focus:ring-teal-200"
							/>
						</div>

						<div>
							<label for="new-unit" class="mb-1 block font-medium"
								>Unit <span class="text-red-500">*</span></label
							>
							<select
								id="new-unit"
								bind:value={unit}
								class="w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring focus:ring-teal-200"
							>
								{#each UNITS as unitOption (unitOption)}
									<option value={unitOption}>{unitOption}</option>
								{/each}
							</select>
							<p class="mt-1 text-xs text-slate-500">
								Choose the standard unit for measuring this ingredient
							</p>
						</div>

						<div class="grid grid-cols-2 gap-4">
							<div>
								<label for="new-calories" class="mb-1 block font-medium"
									>Calories (per {unit}) <span class="text-red-500">*</span
									></label
								>
								<input
									id="new-calories"
									type="number"
									bind:value={newCalories}
									min="0"
									placeholder="165"
									class="w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring focus:ring-teal-200"
								/>
							</div>

							<div>
								<label for="new-protein" class="mb-1 block font-medium"
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
									class="w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring focus:ring-teal-200"
								/>
							</div>
						</div>
					</div>
				{/if}

				<!-- Quantity (Always visible when ingredient selected or adding new) -->
				{#if selectedIngredient || isAddingNew}
					<div class="mb-4">
						<label for="quantity" class="mb-1 block font-medium"
							>Quantity ({unit}) <span class="text-red-500">*</span></label
						>
						<input
							id="quantity"
							type="number"
							bind:value={quantity}
							min="0.1"
							step="0.1"
							placeholder="e.g., 250"
							class="w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring focus:ring-teal-200"
						/>
					</div>

					<!-- Nutrition Preview -->
					<div class="rounded border border-slate-300 bg-slate-50 p-3 mb-4">
						<div class="text-sm font-medium text-slate-700">
							Total for this quantity:
						</div>
						<div class="text-lg font-semibold text-teal-700">
							{Math.round(totalCalories)} calories, {totalProtein.toFixed(1)}g
							protein
						</div>
					</div>
				{/if}
			</div>

			<!-- Modal Footer -->
			<div class="modal-footer">
				<button type="button" class="cancel-button" on:click={closeModal}>
					Cancel
				</button>
				<button
					type="button"
					class="add-button"
					on:click={handleAdd}
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
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 1rem;
	}

	.modal-content {
		background: white;
		border-radius: 12px;
		max-width: 600px;
		width: 100%;
		max-height: 90vh;
		display: flex;
		flex-direction: column;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
			0 10px 10px -5px rgba(0, 0, 0, 0.04);
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem;
		border-bottom: 1px solid #e5e7eb;
	}

	.close-button {
		background: none;
		border: none;
		font-size: 2rem;
		line-height: 1;
		cursor: pointer;
		color: #6b7280;
		padding: 0;
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.close-button:hover {
		color: #374151;
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
		border-top: 1px solid #e5e7eb;
	}

	.mode-button {
		flex: 1;
		padding: 0.5rem 1rem;
		border: 2px solid #d1d5db;
		background: white;
		border-radius: 8px;
		cursor: pointer;
		font-weight: 500;
		transition: all 0.2s;
	}

	.mode-button.active {
		background: #0f766e;
		color: white;
		border-color: #0f766e;
	}

	.mode-button:hover:not(.active) {
		border-color: #0f766e;
		color: #0f766e;
	}

	.result-item {
		width: 100%;
		text-align: left;
		padding: 0.75rem;
		border: 1px solid #e5e7eb;
		border-radius: 6px;
		background: white;
		cursor: pointer;
		transition: all 0.2s;
	}

	.result-item:hover {
		border-color: #0f766e;
		background: #f0fdfa;
	}

	.cancel-button {
		padding: 0.6rem 1.2rem;
		border: 1px solid #d1d5db;
		background: white;
		border-radius: 8px;
		cursor: pointer;
		font-weight: 500;
	}

	.cancel-button:hover {
		background: #f3f4f6;
	}

	.add-button {
		padding: 0.6rem 1.2rem;
		background: #0f766e;
		color: white;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		font-weight: 500;
	}

	.add-button:hover:not(:disabled) {
		background: #115e59;
	}

	.add-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
