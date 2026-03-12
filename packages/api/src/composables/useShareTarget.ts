import { shallowRef } from 'vue';

/** Parsed shared content ready for compose screen consumption */
export interface SharedContent {
  urls: string[];
  text?: string;
  title?: string;
}

/** Raw event shape from share target plugins (capawesome/capgo) */
export interface ShareReceivedEvent {
  title?: string;
  texts?: string[];
  files?: Array<{ uri: string; name: string; mimeType: string }>;
}

type ShareCallback = (content: SharedContent) => void | Promise<void>;

const URL_REGEX = /https?:\/\/\S+/g;
const TRAILING_PUNCT = /[)\].,]+$/;
const WHITESPACE_RE = /\s+/g;

/** Extract all URLs from an array of text strings, deduplicated */
function extractUrls(texts: string[]): string[] {
  const seen = new Set<string>();
  const urls: string[] = [];

  for (const text of texts) {
    const matches = text.match(URL_REGEX);
    if (!matches)
      continue;
    for (const raw of matches) {
      const cleaned = raw.replace(TRAILING_PUNCT, '');
      if (!seen.has(cleaned)) {
        seen.add(cleaned);
        urls.push(cleaned);
      }
    }
  }

  return urls;
}

/** Join texts, strip URLs, and return the leftover non-URL text */
function extractNonUrlText(texts: string[]): string {
  return texts
    .join(' ')
    .replace(URL_REGEX, '')
    .replace(WHITESPACE_RE, ' ')
    .trim();
}

/**
 * Platform-agnostic share target handling.
 *
 * The composable provides the logic — the consumer wires platform events:
 * - Native: `ShareTarget.addListener('shareReceived', (e) => shareTarget.handleShare(e))`
 *
 * Manages:
 * - Reactive `sharedContent` state
 * - Share callback registration
 * - URL extraction from shared text
 */
export function useShareTarget() {
  const sharedContent = shallowRef<SharedContent | null>(null);
  const callbacks: ShareCallback[] = [];

  /**
   * Process a raw share target plugin event.
   * Extracts URLs, sets reactive state, fires registered callbacks.
   */
  async function handleShare(event: ShareReceivedEvent): Promise<void> {
    const texts = event.texts ?? [];
    const urls = extractUrls(texts);
    const nonUrlText = extractNonUrlText(texts);

    const content: SharedContent = {
      urls,
      ...(nonUrlText ? { text: nonUrlText } : {}),
      ...(event.title ? { title: event.title } : {}),
    };

    sharedContent.value = content;

    for (const cb of callbacks) {
      try {
        await cb(content);
      }
      catch (err) {
        console.error('[useShareTarget] callback error:', err);
      }
    }
  }

  /**
   * Register a callback to run when content is shared into the app.
   * Returns an unregister function.
   */
  function onShare(callback: ShareCallback): () => void {
    callbacks.push(callback);
    return () => {
      const idx = callbacks.indexOf(callback);
      if (idx >= 0)
        callbacks.splice(idx, 1);
    };
  }

  /** Clear shared content after consumption */
  function clear(): void {
    sharedContent.value = null;
  }

  return {
    /** Reactive parsed shared content (null when nothing shared) */
    sharedContent,
    /** Process a raw plugin event */
    handleShare,
    /** Register a share callback. Returns unregister function. */
    onShare,
    /** Clear shared content after consumption */
    clear,
  };
}
