import '@anthropic-ai/sdk/shims/web';
import Anthropic from '@anthropic-ai/sdk';
import Constants from 'expo-constants';
import { validateRecipeResponse } from '../schemas/recipe';

/**
 * System prompt template. {SEEN_IDS} and {TAG_PROFILE} are injected at call time.
 * Keep this in sync with contracts/claude-recipe-schema.md (schema version 1.0.0).
 */
const SYSTEM_PROMPT_TEMPLATE = `You are a recipe suggestion AI. Analyse the ingredient photo provided by the user and return ONLY a valid JSON object — no prose, no markdown, no code fences.

The JSON object MUST have this exact structure:
{
  "recipes": [
    {
      "id": "<kebab-case slug derived from name>",
      "name": "<recipe name>",
      "description": "<1–3 sentence description>",
      "tags": ["<tag1>", "<tag2>"],
      "estimatedTime": "<human-readable time, e.g. '25 minutes'>",
      "servings": <integer>,
      "ingredients": [
        { "item": "<ingredient name>", "quantity": "<amount>", "unit": "<unit of measure, or empty string if not applicable>" }
      ],
      "steps": ["<step 1>", "<step 2>"],
      "imageSearchQuery": "<2–5 word search phrase for a dish photo>"
    }
  ]
}

Rules:
1. Return EXACTLY 5 recipe objects in the "recipes" array.
2. Only suggest recipes using ingredients clearly visible in the photo plus commonly available pantry staples (salt, oil, basic spices).
3. Tags MUST be lowercase, single words or hyphenated phrases (e.g. "gluten-free"). Good tags: cuisine (italian, asian, mexican), diet (vegan, vegetarian, keto), characteristics (quick, spicy, comfort-food, one-pot).
4. Do NOT include any recipe whose id appears in this seen list: {SEEN_IDS}
5. Weight your suggestions toward tags with high positive scores and away from tags with negative scores in this preference profile (empty object = neutral): {TAG_PROFILE}
6. The imageSearchQuery should be a concise phrase that returns appetising photos of the finished dish.`;

function buildSystemPrompt(seenIds, tagProfile) {
  return SYSTEM_PROMPT_TEMPLATE
    .replace('{SEEN_IDS}', JSON.stringify(seenIds ?? []))
    .replace('{TAG_PROFILE}', JSON.stringify(tagProfile ?? {}));
}

let _client = null;

function getClient() {
  if (!_client) {
    const apiKey = Constants.expoConfig?.extra?.claudeApiKey;
    if (!apiKey) {
      throw new Error('CLAUDE_API_KEY is not set in app.config.js extra');
    }
    _client = new Anthropic({ apiKey });
  }
  return _client;
}

/**
 * Fetches 5 recipe suggestions from Claude based on an ingredient photo.
 *
 * @param {string} photoBase64 - Raw base64-encoded JPEG (no data URI prefix)
 * @param {string[]} seenIds   - Recipe IDs already shown; excluded from response
 * @param {Record<string, number>} tagProfile - Tag preference weights
 * @returns {Promise<import('../schemas/recipe').Recipe[]>}
 * @throws {Error} on network failure, empty response, or JSON parse error
 * @throws {import('../schemas/recipe').RecipeSchemaError} on schema violation
 */
export async function fetchRecipes(photoBase64, seenIds = [], tagProfile = {}) {
  const client = getClient();

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: buildSystemPrompt(seenIds, tagProfile),
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/jpeg',
              data: photoBase64,
            },
          },
          {
            type: 'text',
            text: 'Please suggest 5 recipes I can make with these ingredients.',
          },
        ],
      },
    ],
  });

  const rawText = response.content[0]?.text;
  if (!rawText) {
    throw new Error('Claude returned an empty response');
  }

  const parsed = JSON.parse(rawText);
  validateRecipeResponse(parsed);
  return parsed.recipes;
}
