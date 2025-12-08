import type { Actions, PageServerLoad } from "./$types";
import { fail, redirect, isRedirect } from "@sveltejs/kit";
import type { Ingredient } from "$lib/types/Ingredient";
import type { Cuisine } from "$lib/types/Cuisine";

export const load: PageServerLoad = async ({ params, locals }) => {
	const { supabase, safeGetSession } = locals;
	const { session } = await safeGetSession();
	const { slug } = params;

	// Require authentication
	if (!session) {
		throw redirect(303, "/");
	}

	// Load the recipe
	const { data: recipe, error: recipeError } = await supabase
		.from("recipes")
		.select(
			`
      *,
      recipe_ingredients(*, ingredients(*))
    `
		)
		.eq("id", slug)
		.single();

	if (recipeError || !recipe) {
		throw redirect(303, "/");
	}

	// Verify ownership
	if (recipe.user_id !== session.user.id) {
		throw redirect(303, `/recipe/${slug}`);
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
	const { data: ingredients, error: ingredientError } = await supabase
		.from("ingredients")
		.select("name, calories, protein, unit")
		.order("name")
		.returns<Ingredient[]>();

	if (ingredientError) {
		console.error("Error loading ingredients:", ingredientError);
	}

	return {
		recipe,
		cuisines: cuisines ?? [],
		existingIngredients: ingredients ?? [],
	};
};

export const actions: Actions = {
	update: async ({ request, params, locals }) => {
		const { supabase, safeGetSession } = locals;
		const { session } = await safeGetSession();
		const { slug } = params;

		if (!session) {
			return fail(401, { message: "Unauthorized" });
		}

		try {
			const formData = await request.formData();
			const recipeName = formData.get("recipeName") as string;
			const cookingTime = parseInt(formData.get("cookingTime") as string);
			const cuisine = formData.get("cuisine") as string;
			const recipeImageUrl = formData.get("recipeImageUrl") as string;
			const methodStepsRaw = formData.get("methodSteps") as string;
			const ingredientsRaw = formData.get("ingredients") as string;

			// Verify ownership
			const { data: recipe } = await supabase
				.from("recipes")
				.select("user_id")
				.eq("id", slug)
				.single();

			if (!recipe || recipe.user_id !== session.user.id) {
				return fail(403, { message: "Forbidden" });
			}

			// Parse JSON fields
			const methodSteps = JSON.parse(methodStepsRaw);
			const ingredients = JSON.parse(ingredientsRaw);

			// Calculate nutritional totals
			const totalCalories = ingredients.reduce(
				(sum: number, ing: { calories: number; quantity: number }) =>
					sum + ing.calories * ing.quantity,
				0
			);
			const totalProtein = ingredients.reduce(
				(sum: number, ing: { protein: number; quantity: number }) =>
					sum + ing.protein * ing.quantity,
				0
			);

			// Update the recipe
			const { error: updateError } = await supabase
				.from("recipes")
				.update({
					recipename: recipeName,
					cookingtime: cookingTime,
					cuisine: cuisine,
					recipeimageurl: recipeImageUrl || null,
					method: methodSteps.filter((s: string) => s.trim()),
					total_calories: totalCalories,
					total_protein: totalProtein,
				})
				.eq("id", slug);

			if (updateError) {
				console.error("Error updating recipe:", updateError);
				return fail(500, {
					message: "Failed to update recipe",
					error: updateError.message,
				});
			}

			// Delete existing recipe_ingredients
			await supabase.from("recipe_ingredients").delete().eq("recipeid", slug);

			// Handle new ingredients (create if they don't exist)
			for (const ing of ingredients) {
				if (ing.isNew) {
					const { error: ingredientError } = await supabase
						.from("ingredients")
						.insert({
							name: ing.name,
							calories: ing.calories,
							protein: ing.protein,
							unit: ing.unit,
						});

					if (ingredientError) {
						console.error("Error creating ingredient:", ingredientError);
					}
				}
			}

			// Re-link ingredients
			const { error: linkError } = await supabase
				.from("recipe_ingredients")
				.insert(
					ingredients.map(
						(ing: {
							name: string;
							quantity: number;
							unit: string;
						}) => ({
							recipeid: slug,
							ingredientid: ing.name,
							quantity: ing.quantity,
							type: ing.unit,
						})
					)
				);

			if (linkError) {
				console.error("Error linking ingredients:", linkError);
				return fail(500, {
					message: "Recipe updated but failed to update ingredients",
					error: linkError.message,
				});
			}

			// SUCCESS: Redirect to the recipe
			throw redirect(303, `/recipe/${slug}`);
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
