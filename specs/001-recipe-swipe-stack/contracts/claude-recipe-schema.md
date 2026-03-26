# Contract: Claude Recipe Response Schema

**Principle II — Structured AI Contracts**
**Version**: 1.0.0
**Date**: 2026-03-24
**Implemented in**: `src/schemas/recipe.js`

> This document is the authoritative definition of the JSON structure Claude MUST return.
> `claudeService.js` validates every response against this contract before use.
> Changes to this schema require a version bump and an update to the system prompt.

---

## Response Envelope

Claude MUST return **only** a valid JSON object — no prose, no markdown code fences,
no preamble. The root object has one key:

```json
{
  "recipes": [ ...exactly 5 Recipe objects... ]
}
```

Any response that:
- Is not valid JSON
- Has a root key other than `"recipes"`
- Has `recipes.length !== 5`

...MUST be treated as a schema validation error and trigger the retry/error flow.

---

## Recipe Object Schema

```json
{
  "id": "spicy-thai-basil-chicken",
  "name": "Spicy Thai Basil Chicken",
  "description": "A quick stir-fry with bold, aromatic flavours. Ready in under 30 minutes.",
  "tags": ["thai", "spicy", "chicken", "quick"],
  "estimatedTime": "25 minutes",
  "servings": 2,
  "ingredients": [
    { "item": "chicken breast", "quantity": "300 g" },
    { "item": "fresh thai basil leaves", "quantity": "1 cup" },
    { "item": "fish sauce", "quantity": "2 tbsp" }
  ],
  "steps": [
    "Heat oil in a wok over high heat until smoking.",
    "Add garlic and chilli; stir-fry 30 seconds.",
    "Add chicken; cook until no longer pink, about 4 minutes.",
    "Add fish sauce and sugar; toss to coat.",
    "Remove from heat, fold in basil leaves, and serve over rice."
  ],
  "imageSearchQuery": "thai basil chicken stir fry"
}
```

### Field Constraints

| Field              | Type       | Required | Rules                                                    |
|--------------------|------------|----------|----------------------------------------------------------|
| `id`               | string     | ✅       | Kebab-case; derived from `name`; non-empty               |
| `name`             | string     | ✅       | Non-empty; ≤ 80 characters                               |
| `description`      | string     | ✅       | Non-empty; 1–3 sentences                                 |
| `tags`             | string[]   | ✅       | ≥ 1 tag; each tag lowercase, no spaces, ≤ 30 chars      |
| `estimatedTime`    | string     | ✅       | Human-readable duration string; non-empty                |
| `servings`         | number     | ✅       | Integer; ≥ 1                                             |
| `ingredients`      | object[]   | ✅       | ≥ 1 item; each has non-empty `item` and `quantity`       |
| `steps`            | string[]   | ✅       | ≥ 1 step; ordered; each step non-empty                   |
| `imageSearchQuery` | string     | ✅       | 2–5 words; suitable for a photo search engine            |

---

## System Prompt Template

The following system prompt is version-controlled alongside this contract.
`{SEEN_IDS}` and `{TAG_PROFILE}` are injected at runtime by `claudeService.js`.

```
You are a recipe suggestion AI. Analyse the ingredient photo provided by the user
and return ONLY a valid JSON object — no prose, no markdown, no code fences.

The JSON object MUST have this exact structure:
{
  "recipes": [
    {
      "id": "<kebab-case slug derived from name>",
      "name": "<recipe name>",
      "description": "<1–3 sentence description>",
      "tags": ["<tag1>", "<tag2>", ...],
      "estimatedTime": "<human-readable time>",
      "servings": <integer>,
      "ingredients": [
        { "item": "<ingredient name>", "quantity": "<amount>" },
        ...
      ],
      "steps": ["<step 1>", "<step 2>", ...],
      "imageSearchQuery": "<2–5 word search phrase for a dish photo>"
    }
  ]
}

Rules:
1. Return EXACTLY 5 recipe objects in the "recipes" array.
2. Only suggest recipes using ingredients clearly visible in the photo plus commonly
   available pantry staples (salt, oil, basic spices).
3. Tags MUST be lowercase, single words or hyphenated phrases (e.g. "gluten-free").
   Good tags: cuisine (italian, asian, mexican), diet (vegan, vegetarian, keto),
   characteristics (quick, spicy, comfort-food, one-pot).
4. Do NOT include any recipe whose id appears in this seen list:
   {SEEN_IDS}
5. Weight your suggestions toward tags with high positive scores and away from tags
   with high negative scores in this preference profile (empty = neutral):
   {TAG_PROFILE}
6. The imageSearchQuery should be a concise, descriptive phrase that would return
   appetising photos of the finished dish.
```

---

## Runtime Validation Logic

`src/schemas/recipe.js` exports a `validateRecipeResponse(parsed)` function that checks:

1. `parsed` is an object with key `"recipes"`.
2. `parsed.recipes` is an array of length exactly 5.
3. For each recipe: all required fields present, types match, constraints satisfied.
4. Throws `RecipeSchemaError(message, invalidRecipe)` on first violation.

The validator is called in `claudeService.js` immediately after `JSON.parse(rawText)`.
If validation throws, the error is re-thrown as a fetch error and the UI transitions
to `ERROR_STATE`.

---

## Schema Version History

| Version | Date       | Change                   |
|---------|------------|--------------------------|
| 1.0.0   | 2026-03-24 | Initial schema definition |
