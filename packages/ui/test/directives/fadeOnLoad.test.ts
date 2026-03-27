import { describe, expect, it } from 'vitest';
import { vFadeOnLoad } from '../../src/directives/fadeOnLoad';

function createImg(overrides: Partial<HTMLImageElement> = {}): HTMLImageElement {
  const img = document.createElement('img');
  // happy-dom defaults: complete = false, naturalWidth = 0
  Object.defineProperties(img, {
    complete: { value: overrides.complete ?? false, writable: true },
    naturalWidth: { value: overrides.naturalWidth ?? 0, writable: true },
  });
  return img;
}

function mount(img: HTMLImageElement) {
  // Simulate Vue directive mounted hook
  vFadeOnLoad.mounted!(img, {} as any, {} as any, null);
}

describe('vFadeOnLoad directive', () => {
  it('sets opacity to 0 and decoding to async on mount', () => {
    const img = createImg();
    mount(img);

    expect(img.style.opacity).toBe('0');
    expect(img.getAttribute('decoding')).toBe('async');
  });

  it('sets transition style on mount', () => {
    const img = createImg();
    mount(img);

    expect(img.style.transition).toBe('opacity 200ms ease');
  });

  it('sets opacity to 1 when load event fires', () => {
    const img = createImg();
    mount(img);

    expect(img.style.opacity).toBe('0');

    img.dispatchEvent(new Event('load'));

    expect(img.style.opacity).toBe('1');
  });

  it('sets opacity to 1 immediately when image is already cached (complete)', () => {
    const img = createImg({ complete: true, naturalWidth: 200 });
    mount(img);

    expect(img.style.opacity).toBe('1');
  });

  it('does not set opacity to 1 for complete images with naturalWidth 0 (broken)', () => {
    const img = createImg({ complete: true, naturalWidth: 0 });
    mount(img);

    expect(img.style.opacity).toBe('0');
  });

  it('sets opacity to 1 on error (does not leave image invisible)', () => {
    const img = createImg();
    mount(img);

    expect(img.style.opacity).toBe('0');

    img.dispatchEvent(new Event('error'));

    expect(img.style.opacity).toBe('1');
  });

  it('load listener fires only once', () => {
    const img = createImg();
    mount(img);

    img.dispatchEvent(new Event('load'));
    expect(img.style.opacity).toBe('1');

    // Reset to verify it doesn't fire again
    img.style.opacity = '0';
    img.dispatchEvent(new Event('load'));
    expect(img.style.opacity).toBe('0');
  });
});
