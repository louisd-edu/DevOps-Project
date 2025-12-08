// Measurement units enum matching database
export type MeasurementUnit =
	| "g"
	| "kg"
	| "ml"
	| "l"
	| "cup"
	| "tbsp"
	| "tsp"
	| "oz"
	| "lb"
	| "piece"
	| "clove"
	| "pinch"
	| "handful"
	| "slice"
	| "can"
	| "bunch";

export type Ingredient = {
	name: string;
	calories: number; // per unit specified
	protein: number; // per unit specified
	unit: MeasurementUnit; // the unit this ingredient is measured in
};
