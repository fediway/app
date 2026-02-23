/**
 * Universal plugin — applies `.dark` class to `<html>` during SSR only.
 *
 * Reads the resolved theme cookie (always 'dark' or 'light', never 'system')
 * so the server-rendered HTML includes the correct class — no flash.
 *
 * On the client, useDarkMode's watcher manages the class via classList
 * so this plugin does not interfere.
 */
export default defineNuxtPlugin(() => {
  if (!import.meta.server)
    return;

  const resolved = useCookie('fediway_theme_resolved');

  if (resolved.value === 'dark') {
    useHead({
      htmlAttrs: { class: 'dark' },
    });
  }
});
