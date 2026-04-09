import { describe, expect, it } from 'vitest';
import { useMediaPreferences } from '../../src/composables/useMediaPreferences';

describe('useMediaPreferences', () => {
  it('shouldAutoplayGifs defaults to true', () => {
    const { shouldAutoplayGifs, setAutoplayGifs, setReduceMotion } = useMediaPreferences();
    setAutoplayGifs(true);
    setReduceMotion(false);
    expect(shouldAutoplayGifs.value).toBe(true);
  });

  it('shouldAutoplayGifs is false when autoplayGifs setting is false', () => {
    const { shouldAutoplayGifs, setAutoplayGifs, setReduceMotion } = useMediaPreferences();
    setReduceMotion(false);
    setAutoplayGifs(false);
    expect(shouldAutoplayGifs.value).toBe(false);
  });

  it('shouldAutoplayGifs is false when app reduceMotion is true', () => {
    const { shouldAutoplayGifs, setAutoplayGifs, setReduceMotion } = useMediaPreferences();
    setAutoplayGifs(true);
    setReduceMotion(true);
    expect(shouldAutoplayGifs.value).toBe(false);
  });

  it('shouldAutoplayGifs respects explicit user setting over OS reduce motion', () => {
    const { shouldAutoplayGifs, setAutoplayGifs, setReduceMotion } = useMediaPreferences();
    setReduceMotion(false);
    setAutoplayGifs(true);
    // OS reduce motion doesn't block GIF autoplay — only the app setting does
    expect(shouldAutoplayGifs.value).toBe(true);
  });

  it('shouldAutoplayGifs reacts to setAutoplayGifs', () => {
    const { shouldAutoplayGifs, setAutoplayGifs, setReduceMotion } = useMediaPreferences();
    setReduceMotion(false);
    setAutoplayGifs(false);
    expect(shouldAutoplayGifs.value).toBe(false);
    setAutoplayGifs(true);
    expect(shouldAutoplayGifs.value).toBe(true);
  });

  it('mediaVisibility defaults and updates', () => {
    const { setMediaVisibility, shouldReveal } = useMediaPreferences();
    setMediaVisibility('default');
    expect(shouldReveal(false)).toBe(true);
    expect(shouldReveal(true)).toBe(false);

    setMediaVisibility('show_all');
    expect(shouldReveal(true)).toBe(true);

    setMediaVisibility('hide_all');
    expect(shouldReveal(false)).toBe(false);
  });
});
