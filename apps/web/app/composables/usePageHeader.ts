import type { MaybeRef } from 'vue';

export interface PageHeaderOptions {
  title: MaybeRef<string>;
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
    subtitle?: string;
    image?: string;
    icon?: string;
  } | null>('nav:pageHeaderOverride');

  watchEffect(() => {
    activeId.value = id;
    override.value = {
      title: toValue(options.title),
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
