export type RecipeIngredient = {
  name: string;
  quantity: number;
  unit: string;
  calories: number; // total for this quantity
  protein: number; // total for this quantity
  isNew?: boolean; // flag indicating new ingredient to be created
};
