import type { MeasurementUnit } from "./Ingredient";

export type RecipeIngredient = {
  name: string;
  quantity: number;
  unit: MeasurementUnit;
  calories: number; // total for this quantity
  protein: number; // total for this quantity
  isNew?: boolean; // flag indicating new ingredient to be created
};
