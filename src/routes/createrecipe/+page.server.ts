import { fail, redirect, isRedirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import type { Ingredient } from "$lib/types/Ingredient";
import type { Cuisine } from "$lib/types/Cuisine";
import type { RecipeIngredient } from "$lib/types/RecipeIngredient";
import { generateShareToken } from "$lib/server/generateShareToken";

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
	const { session } = await safeGetSession();

	// Require authentication
	if (!session) {
		throw redirect(303, "/");
	}

	// Load cuisines for selection
	const { data: cuisines, error: cuisineError } = await supabase
		.from("cuisines")
		.select("name, broader_areas")
		.order("name")
		.returns<Cuisine[]>();

	if (cuisineError) {
		console.error("Error loading cuisines:", cuisineError);
	}

	// Load all ingredients for autocomplete
	const { data: ingredients, error: ingredientError} = await supabase
		.from("ingredients")
		.select("name, calories, protein, unit")
		.order("name")
		.returns<Ingredient[]>();

	if (ingredientError) {
		console.error("Error loading ingredients:", ingredientError);
	}

	return {
		session,
		cuisines: cuisines ?? [],
		ingredients: ingredients ?? [],
	};
};

export const actions: Actions = {
	create: async ({ request, locals: { supabase, safeGetSession } }) => {
		const { session } = await safeGetSession();

		// Auth check
		if (!session) {
			return fail(401, { message: "You must be logged in to create a recipe" });
		}

		const formData = await request.formData();

		// Extract and parse form data
		const recipeName = (formData.get("recipeName") as string)?.trim();
		const cookingTime = parseInt(formData.get("cookingTime") as string);
		const cuisine = formData.get("cuisine") as string;
		const recipeImageUrl = formData.get("recipeImageUrl") as string;
		const methodSteps = JSON.parse(
			formData.get("methodSteps") as string
		) as string[];
		const ingredients = JSON.parse(
			formData.get("ingredients") as string
		) as RecipeIngredient[];
		const isPublic = formData.get("isPublic") === "true";

		// Validation
		const errors: Record<string, string> = {};

		if (!recipeName || recipeName.length < 3) {
			errors.recipeName = "Recipe name must be at least 3 characters";
		}
		if (recipeName && recipeName.length > 200) {
			errors.recipeName = "Recipe name must be less than 200 characters";
		}
		if (!cookingTime || cookingTime < 1 || cookingTime > 1440) {
			errors.cookingTime =
				"Cooking time must be between 1 and 1440 minutes";
		}
		if (!cuisine) {
			errors.cuisine = "Please select a cuisine";
		}
		if (!methodSteps || methodSteps.filter((s) => s.trim()).length === 0) {
			errors.method = "Please add at least one method step";
		}
		if (!ingredients || ingredients.length === 0) {
			errors.ingredients = "Please add at least one ingredient";
		}

		// Validate ingredient data
		for (const ing of ingredients) {
			if (!ing.name || !ing.quantity || !ing.unit) {
				errors.ingredients = "Invalid ingredient data";
				break;
			}
			if (ing.quantity <= 0) {
				errors.ingredients = "Ingredient quantities must be positive";
				break;
			}
		}

		if (Object.keys(errors).length > 0) {
			return fail(400, {
				errors,
				data: {
					recipeName,
					cookingTime,
					cuisine,
					recipeImageUrl,
					methodSteps,
					ingredients,
				},
			});
		}

		// Calculate totals
		const totalCalories = ingredients.reduce(
			(sum, ing) => sum + ing.calories * ing.quantity,
			0
		);
		const totalProtein = ingredients.reduce(
			(sum, ing) => sum + ing.protein * ing.quantity,
			0
		);

		// Filter empty method steps
		const cleanedSteps = methodSteps.map((s) => s.trim()).filter((s) => s.length > 0);

		// Generate share token for private recipes
		const shareToken = isPublic ? null : generateShareToken();

		try {
			// STEP 1: Insert new ingredients (if any)
			const newIngredients = ingredients.filter((ing) => ing.isNew);

			if (newIngredients.length > 0) {
				const { error: ingError } = await supabase.from("ingredients").insert(
					newIngredients.map((ing) => ({
						name: ing.name,
						calories: ing.calories / ing.quantity, // Store per-unit values
						protein: ing.protein / ing.quantity,
						unit: ing.unit, // Store the unit for this ingredient
					}))
				);

				if (ingError) {
					console.error("Error inserting ingredients:", ingError);
					// Check for duplicate ingredient error
					if (ingError.code === "23505") {
						// Postgres unique violation
						return fail(400, {
							errors: {
								ingredients: "One or more ingredients already exist",
							},
							data: {
								recipeName,
								cookingTime,
								cuisine,
								recipeImageUrl,
								methodSteps,
								ingredients,
							},
						});
					}
					return fail(500, {
						message: "Failed to add new ingredients",
						error: ingError.message,
					});
				}
			}

			// STEP 2: Insert recipe
			const { data: recipe, error: recipeError } = await supabase
				.from("recipes")
				.insert({
					user_id: session.user.id,
					recipename: recipeName,
					recipeimageurl: recipeImageUrl || null,
					cuisine,
					cookingtime: cookingTime,
					method: cleanedSteps,
					total_calories: Math.round(totalCalories),
					total_protein: parseFloat(totalProtein.toFixed(1)),
					is_public: isPublic,
					share_token: shareToken,
				})
				.select("id")
				.single();

			if (recipeError) {
				console.error("Error creating recipe:", recipeError);
				return fail(500, {
					message: "Failed to create recipe",
					error: recipeError.message,
				});
			}

			// STEP 3: Link ingredients to recipe
			const { error: linkError } = await supabase
				.from("recipe_ingredients")
				.insert(
					ingredients.map((ing) => ({
						recipeid: recipe.id,
						ingredientid: ing.name, // FK to ingredients.name
						quantity: ing.quantity,
						type: ing.unit,
					}))
				);

			if (linkError) {
				console.error("Error linking ingredients:", linkError);
				return fail(500, {
					message:
						"Recipe created but failed to add ingredients. Please contact support.",
					error: linkError.message,
					recipeId: recipe.id,
				});
			}

			// SUCCESS: Redirect to the new recipe
			throw redirect(303, `/recipe/${recipe.id}`);
		} catch (error) {
			// Re-throw redirects
			if (isRedirect(error)) throw error;

			console.error("Unexpected error:", error);
			return fail(500, {
				message: "An unexpected error occurred",
				error: error instanceof Error ? error.message : "Unknown error",
			});
		}
	},
};
