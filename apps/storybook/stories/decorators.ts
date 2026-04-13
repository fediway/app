/**
 * Shared story decorators for consistent component sizing.
 *
 * Use these instead of inline `style="max-width: XXXpx"` in story templates.
 * Three standard widths matching common UI contexts:
 *
 * - narrow (280px): Nav items, avatars, toggles, small cards
 * - medium (400px): Form inputs, dropdowns, tag lists, chat items
 * - wide (600px): Statuses, timeline, compose, media, profiles
 */

/** 280px — small components (nav items, avatars, toggles) */
export function narrowDecorator() {
  return {
    template: '<div style="max-width: 280px"><story /></div>',
  };
}

/** 400px — medium components (form inputs, dropdowns, cards) */
export function mediumDecorator() {
  return {
    template: '<div style="max-width: 400px"><story /></div>',
  };
}

/** 600px — full-width components (statuses, timeline, compose) */
export function wideDecorator() {
  return {
    template: '<div style="max-width: 600px"><story /></div>',
  };
}

/**
 * Renders the story twice side-by-side: light mode on the left, dark mode
 * on the right, both at the wide (600px) status width. Intended for visual
 * audit of components that need to look balanced in both themes — rails,
 * tombstones, badges, anything that uses a muted token.
 */
export function lightDarkDecorator() {
  return {
    template: `
      <div style="display: flex; gap: 24px; align-items: flex-start;">
        <div style="flex: 1; max-width: 600px; background: var(--background); color: var(--foreground); padding: 12px; border-radius: 8px;">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.5; margin-bottom: 8px;">Light</div>
          <story />
        </div>
        <div class="dark" style="flex: 1; max-width: 600px; background: var(--background); color: var(--foreground); padding: 12px; border-radius: 8px;">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.5; margin-bottom: 8px;">Dark</div>
          <story />
        </div>
      </div>
    `,
  };
}
