Directory structure:
└── louisd-edu-devops-project/
├── README.md
├── eslint.config.js
├── package.json
├── svelte.config.js
├── tsconfig.json
├── vite.config.ts
├── vitest.config 2.ts
├── vitest.config.ts
├── .env.example
├── .mcp.json
├── .npmrc
├── src/
│   ├── app.css
│   ├── app.d.ts
│   ├── app.html
│   ├── hooks.server.ts
│   ├── lib/
│   │   ├── index.ts
│   │   ├── supabaseClient.ts
│   │   ├── useFavoritesAndSaved.ts
│   │   ├── components/
│   │   │   ├── Avatar.svelte
│   │   │   ├── AvatarCropper.svelte
│   │   │   ├── AvatarUpload.svelte
│   │   │   ├── Chip.svelte
│   │   │   ├── IngredientModal.svelte
│   │   │   ├── NavProfile.svelte
│   │   │   ├── prepareImageUrls.test.ts
│   │   │   ├── prepareImageUrls.ts
│   │   │   ├── PrivacyBadge.svelte
│   │   │   ├── RecipeComponent.svelte
│   │   │   ├── RecipeImageCropper.svelte
│   │   │   ├── RecipeImageUpload.svelte
│   │   │   ├── RecipeInteractionProvider.svelte
│   │   │   └── ShareButton.svelte
│   │   ├── queryBuilders/
│   │   │   ├── recipeQuery.test.ts
│   │   │   └── recipeQuery.ts
│   │   ├── server/
│   │   │   ├── fetchUserRecipes.ts
│   │   │   ├── generateShareToken.ts
│   │   │   └── profileQueries.ts
│   │   └── types/
│   │       ├── Cuisine.ts
│   │       ├── Ingredient.ts
│   │       ├── Profile.ts
│   │       ├── Recipe.ts
│   │       └── RecipeIngredient.ts
│   ├── routes/
│   │   ├── +layout.server.ts
│   │   ├── +layout.svelte
│   │   ├── +layout.ts
│   │   ├── +page.server.ts
│   │   ├── +page.svelte
│   │   ├── account/
│   │   │   ├── +page.server.ts
│   │   │   └── +page.svelte
│   │   ├── auth/
│   │   │   ├── +layout.svelte
│   │   │   ├── +page.server.ts
│   │   │   ├── +page.svelte
│   │   │   ├── confirm/
│   │   │   │   └── +server.ts
│   │   │   └── error/
│   │   │       └── +page.svelte
│   │   ├── createrecipe/
│   │   │   ├── +page.server.ts
│   │   │   └── +page.svelte
│   │   ├── private/
│   │   │   ├── +layout.server.ts
│   │   │   └── +page.svelte
│   │   ├── recipe/
│   │   │   └── [slug]/
│   │   │       ├── +page.server.ts
│   │   │       ├── +page.svelte
│   │   │       └── edit/
│   │   │           ├── +page.server.ts
│   │   │           └── +page.svelte
│   │   ├── upload/
│   │   │   └── +page.svelte
│   │   └── user/
│   │       └── [username]/
│   │           ├── +layout.server.ts
│   │           ├── +layout.svelte
│   │           ├── +page.server.ts
│   │           ├── +page.svelte
│   │           ├── liked/
│   │           │   ├── +page.server.ts
│   │           │   └── +page.svelte
│   │           └── saved/
│   │               ├── +page.server.ts
│   │               └── +page.svelte
│   └── tests/
│       ├── setup 2.ts
│       └── setup.ts
├── static/
│   └── robots.txt
└── .github/
└── workflows/
├── ci.yml
├── eslint.yml
└── prettier.yml


### Build Run and Test Commands
yarn svelte
yarn lint
yarn prettier
yarn test:run

### Deployment Instructions
- Use ES modules (import/export)
- Always typecheck

Write a plan for adding rate limiting to our API. Include:
- Which endpoints need protection
- Storage mechanism for rate data
- Error responses and status codes
- Integration points with existing middleware

Now critique this plan. What did you miss?

Code style rules:
- Use explicit error handling, no unwraps in production code
- Include docstrings for public functions
- Prefer composition over inheritance
- Keep functions under 50 lines
- Use `pretty_assertions` in test
- Be explicit about lifetimes in Rust
- Use `anyhow::Result` for error handling in services and repositories.
- Create domain errors using `thiserror`.
- Never implement `From` for converting domain errors, manually convert them


