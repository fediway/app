import type { Preview } from '@storybook/vue3';
import { withThemeByClassName } from '@storybook/addon-themes';
import { MINIMAL_VIEWPORTS } from '@storybook/addon-viewport';

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
    viewport: {
      options: {
        ...MINIMAL_VIEWPORTS,
        mobile: { name: 'Mobile', styles: { width: '375px', height: '812px' } },
        mobileLarge: { name: 'Mobile Large', styles: { width: '428px', height: '926px' } },
        tablet: { name: 'Tablet', styles: { width: '768px', height: '1024px' } },
        desktop: { name: 'Desktop', styles: { width: '1280px', height: '800px' } },
        desktopWide: { name: 'Wide', styles: { width: '1440px', height: '900px' } },
      },
    },
    sidebar: {
      collapsedRoots: ['02-primitives', '03-form', '04-layout', '05-navigation', '06-account', '07-status', '08-compose', '09-timeline', '10-notification', '11-chat', '12-media', '13-item', '14-trending', '15-recipes'],
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
    story => ({
      components: { story },
      template: '<div class="bg-white dark:bg-background text-foreground p-4"><story /></div>',
    }),
  ],
};

export default preview;
