import type { CustomEmoji } from '@repo/types';
import type { MaybeRef } from 'vue';

export interface PageHeaderOptions {
  title: MaybeRef<string>;
  /**
   * Optional custom emojis for rendering `:shortcode:` references in the title.
   * When present, the header renders the title as HTML with inline emoji images.
   */
  titleEmojis?: MaybeRef<readonly CustomEmoji[] | undefined>;
  subtitle?: MaybeRef<string | undefined>;
  image?: MaybeRef<string | undefined>;
  icon?: MaybeRef<string | undefined>;
}

// Monotonic ID to prevent race conditions during page transitions.
// Each usePageHeader call gets a unique ID. On dispose, it only
// clears the override if it was the last one to set it.
let nextId = 0;
const activeId = ref<number | null>(null);

/**
 * Set the page header for the DesktopFeedHeader.
 * Use on pages that aren't top-level menu destinations
 * (e.g. post detail, profile, tag, link pages).
 *
 * Accepts static strings or reactive refs for dynamic content.
 * Automatically clears when the component unmounts.
 */
export function usePageHeader(options: PageHeaderOptions) {
  const id = ++nextId;
  const override = useState<{
    title: string;
    titleEmojis?: readonly CustomEmoji[];
    subtitle?: string;
    image?: string;
    icon?: string;
  } | null>('nav:pageHeaderOverride');

  watchEffect(() => {
    activeId.value = id;
    override.value = {
      title: toValue(options.title),
      titleEmojis: toValue(options.titleEmojis),
      subtitle: toValue(options.subtitle),
      image: toValue(options.image),
      icon: toValue(options.icon),
    };
  });

  onScopeDispose(() => {
    // Only clear if we're still the active owner
    if (activeId.value === id) {
      override.value = null;
      activeId.value = null;
    }
  });
}

/** Reset all state — for testing only */
export function _resetPageHeaderState() {
  nextId = 0;
  activeId.value = null;
}
