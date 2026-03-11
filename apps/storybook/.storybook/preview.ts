import type { Preview } from '@storybook/vue3';
import { withThemeByClassName } from '@storybook/addon-themes';

// Import the UI package's global styles (Tailwind + CSS variables)
import '@repo/ui/styles/globals.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    withThemeByClassName({
      themes: {
        light: '',
        dark: 'dark',
      },
      defaultTheme: 'light',
    }),
  ],
};

export default preview;
