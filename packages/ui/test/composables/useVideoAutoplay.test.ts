import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick, ref } from 'vue';
import { useVideoAutoplay } from '../../src/composables/useVideoAutoplay';

const activeVideoId = ref<string | null>(null);

vi.mock('../../src/composables/useMediaPlayerState', () => ({
  useMediaPlayerState: () => ({
    activeVideoId,
    setActiveVideo: (id: string | null) => { activeVideoId.value = id; },
  }),
}));

function createMockVideo() {
  const paused = ref(true);
  return {
    ref: ref<HTMLVideoElement>({
      play: vi.fn(() => {
        paused.value = false;
        return Promise.resolve();
      }),
      pause: vi.fn(() => {
        paused.value = true;
      }),
      paused,
    } as any),
    get paused() { return paused.value; },
  };
}

// Mock IntersectionObserver
let observerCallback: IntersectionObserverCallback;
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();

vi.stubGlobal('IntersectionObserver', class {
  constructor(callback: IntersectionObserverCallback) {
    observerCallback = callback;
  }

  observe = mockObserve;
  disconnect = mockDisconnect;
  unobserve = vi.fn();
});

function simulateVisible() {
  observerCallback(
    [{ intersectionRatio: 0.6, isIntersecting: true } as IntersectionObserverEntry],
    {} as IntersectionObserver,
  );
}

function simulateHidden() {
  observerCallback(
    [{ intersectionRatio: 0, isIntersecting: false } as IntersectionObserverEntry],
    {} as IntersectionObserver,
  );
}

describe('useVideoAutoplay', () => {
  beforeEach(() => {
    activeVideoId.value = null;
    vi.clearAllMocks();
  });

  it('plays video when visible and enabled', () => {
    const video = createMockVideo();
    const enabled = ref(true);

    useVideoAutoplay(video.ref, 'test-1', { enabled });
    simulateVisible();

    expect(video.ref.value!.play).toHaveBeenCalled();
  });

  it('does not play when visible but disabled', () => {
    const video = createMockVideo();
    const enabled = ref(false);

    useVideoAutoplay(video.ref, 'test-2', { enabled });
    simulateVisible();

    expect(video.ref.value!.play).not.toHaveBeenCalled();
  });

  it('pauses when scrolled out of view', () => {
    const video = createMockVideo();
    const enabled = ref(true);

    useVideoAutoplay(video.ref, 'test-3', { enabled });
    simulateVisible();
    simulateHidden();

    expect(video.ref.value!.pause).toHaveBeenCalled();
  });

  it('plays when enabled changes to true while visible', async () => {
    const video = createMockVideo();
    const enabled = ref(false);

    useVideoAutoplay(video.ref, 'test-4', { enabled });
    simulateVisible();

    expect(video.ref.value!.play).not.toHaveBeenCalled();

    enabled.value = true;
    await nextTick();

    expect(video.ref.value!.play).toHaveBeenCalled();
  });

  it('pauses when enabled changes to false while playing', async () => {
    const video = createMockVideo();
    const enabled = ref(true);

    useVideoAutoplay(video.ref, 'test-5', { enabled });
    simulateVisible();

    enabled.value = false;
    await nextTick();

    expect(video.ref.value!.pause).toHaveBeenCalled();
  });
});
