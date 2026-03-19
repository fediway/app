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
    sidebar: {
      collapsedRoots: ['02-primitives', '03-form', '04-layout', '05-navigation', '06-account', '07-status', '08-compose', '09-timeline', '10-notification', '11-chat', '12-media', '13-item', '14-brand'],
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
