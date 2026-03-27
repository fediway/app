import type { Directive } from 'vue';

/**
 * Directive that fades in an <img> element when it finishes loading.
 *
 * Handles both fresh loads (@load event) and cached images (img.complete check on mount).
 * The parent container should provide the placeholder (blurhash background, bg-muted, etc.).
 *
 * Usage: <img v-fade-on-load :src="url" />
 */
export const vFadeOnLoad: Directive<HTMLImageElement> = {
  mounted(el) {
    el.style.opacity = '0';
    el.style.transition = 'opacity 200ms ease';
    el.setAttribute('decoding', 'async');

    function show() {
      el.style.opacity = '1';
    }

    if (el.complete && el.naturalWidth > 0) {
      // Already loaded (cached) — show immediately
      show();
    }
    else {
      el.addEventListener('load', show, { once: true });
      el.addEventListener('error', show, { once: true }); // Show on error too — don't leave invisible
    }
  },
};
