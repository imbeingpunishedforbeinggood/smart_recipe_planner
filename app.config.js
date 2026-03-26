import 'dotenv/config';

export default {
  name: 'Smart Recipe Planner',
  slug: 'smart-recipe-planner',
  version: '1.0.0',
  orientation: 'portrait',
  extra: {
    claudeApiKey: process.env.CLAUDE_API_KEY,
    unsplashAccessKey: process.env.UNSPLASH_ACCESS_KEY,
  },
};
