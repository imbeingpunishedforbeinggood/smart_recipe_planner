/**
 * Canonical recipe JSON schema — Constitution Principle II
 *
 * This file MUST exist before any service code is written.
 * claudeService.js calls validateRecipeResponse() on every Claude response.
 *
 * Authoritative contract: specs/001-recipe-swipe-stack/contracts/claude-recipe-schema.md
 * Schema version: 1.0.0
 */

export const RECIPE_SCHEMA = {
  required: [
    'id',
    'name',
    'description',
    'tags',
    'estimatedTime',
    'servings',
    'ingredients',
    'steps',
    'imageSearchQuery',
  ],
};

export class RecipeSchemaError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RecipeSchemaError';
  }
}

/**
 * Validates a parsed Claude response against the canonical recipe schema.
 * Throws RecipeSchemaError on the first violation found.
 *
 * @param {unknown} parsed - The result of JSON.parse(claudeResponseText)
 * @throws {RecipeSchemaError}
 */
export function validateRecipeResponse(parsed) {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new RecipeSchemaError('Response root must be a JSON object');
  }

  if (!Array.isArray(parsed.recipes)) {
    throw new RecipeSchemaError('Response missing "recipes" array at root');
  }

  if (parsed.recipes.length !== 5) {
    throw new RecipeSchemaError(
      `Expected exactly 5 recipes, got ${parsed.recipes.length}`
    );
  }

  parsed.recipes.forEach((recipe, index) => {
    const label = `recipes[${index}]`;

    // Required field presence
    RECIPE_SCHEMA.required.forEach((field) => {
      if (recipe[field] === undefined || recipe[field] === null) {
        throw new RecipeSchemaError(`${label}: missing required field "${field}"`);
      }
    });

    // id
    if (typeof recipe.id !== 'string' || recipe.id.trim().length === 0) {
      throw new RecipeSchemaError(`${label}: "id" must be a non-empty string`);
    }

    // name
    if (typeof recipe.name !== 'string' || recipe.name.trim().length === 0) {
      throw new RecipeSchemaError(`${label}: "name" must be a non-empty string`);
    }

    // description
    if (typeof recipe.description !== 'string' || recipe.description.trim().length === 0) {
      throw new RecipeSchemaError(`${label}: "description" must be a non-empty string`);
    }

    // tags
    if (!Array.isArray(recipe.tags) || recipe.tags.length === 0) {
      throw new RecipeSchemaError(`${label}: "tags" must be a non-empty array`);
    }
    recipe.tags.forEach((tag, i) => {
      if (typeof tag !== 'string' || tag.trim().length === 0) {
        throw new RecipeSchemaError(`${label}: tags[${i}] must be a non-empty string`);
      }
    });

    // estimatedTime
    if (typeof recipe.estimatedTime !== 'string' || recipe.estimatedTime.trim().length === 0) {
      throw new RecipeSchemaError(`${label}: "estimatedTime" must be a non-empty string`);
    }

    // servings
    if (typeof recipe.servings !== 'number' || !Number.isInteger(recipe.servings) || recipe.servings < 1) {
      throw new RecipeSchemaError(`${label}: "servings" must be an integer >= 1`);
    }

    // ingredients
    if (!Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) {
      throw new RecipeSchemaError(`${label}: "ingredients" must be a non-empty array`);
    }
    recipe.ingredients.forEach((ing, i) => {
      if (!ing || typeof ing.item !== 'string' || ing.item.trim().length === 0) {
        throw new RecipeSchemaError(`${label}: ingredients[${i}] missing non-empty "item"`);
      }
      if (typeof ing.quantity !== 'string' || ing.quantity.trim().length === 0) {
        throw new RecipeSchemaError(`${label}: ingredients[${i}] missing non-empty "quantity"`);
      }
      if (ing.unit !== undefined && typeof ing.unit !== 'string') {
        throw new RecipeSchemaError(`${label}: ingredients[${i}] "unit" must be a string when present`);
      }
    });

    // steps
    if (!Array.isArray(recipe.steps) || recipe.steps.length === 0) {
      throw new RecipeSchemaError(`${label}: "steps" must be a non-empty array`);
    }
    recipe.steps.forEach((step, i) => {
      if (typeof step !== 'string' || step.trim().length === 0) {
        throw new RecipeSchemaError(`${label}: steps[${i}] must be a non-empty string`);
      }
    });

    // imageSearchQuery
    if (typeof recipe.imageSearchQuery !== 'string' || recipe.imageSearchQuery.trim().length === 0) {
      throw new RecipeSchemaError(`${label}: "imageSearchQuery" must be a non-empty string`);
    }
  });
}
