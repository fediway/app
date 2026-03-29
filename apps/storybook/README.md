# Fediway Storybook

Component documentation and visual testing powered by Storybook 8.

## Development

```bash
npm run dev:storybook   # starts on port 6006
```

## Adding stories

Stories live in `apps/storybook/stories/`, grouped by domain. Create a `*.stories.ts` file next to the relevant group:

```
stories/
  01-Account/
  02-Status/
  03-Item/
  ...
```

Components are imported from `@repo/ui`.
