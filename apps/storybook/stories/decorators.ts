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
