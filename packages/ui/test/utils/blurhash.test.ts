// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { decodeBlurhash, isBlurhashValid } from '../../src/utils/blurhash';

describe('isBlurhashValid', () => {
  it('returns true for a valid hash', () => {
    expect(isBlurhashValid('LEHV6nWB2yk8pyo0adR*.7kCMdnj')).toBe(true);
  });

  it('returns false for empty string', () => {
    expect(isBlurhashValid('')).toBe(false);
  });

  it('returns false for malformed input', () => {
    expect(isBlurhashValid('abc')).toBe(false); // too short
    expect(isBlurhashValid('!!!!!!!')).toBe(false); // invalid characters
  });

  it('returns false for string with spaces', () => {
    expect(isBlurhashValid('LEHV6n WB2yk8')).toBe(false);
  });
});

describe('decodeBlurhash', () => {
  // Mock canvas since jsdom doesn't support getContext('2d')
  const mockToDataURL = vi.fn(() => 'data:image/png;base64,mockdata');
  const mockPutImageData = vi.fn();
  const mockCreateImageData = vi.fn((w: number, h: number) => ({
    data: new Uint8ClampedArray(w * h * 4),
    width: w,
    height: h,
  }));

  beforeEach(() => {
    mockToDataURL.mockReturnValue('data:image/png;base64,mockdata');
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      createImageData: mockCreateImageData,
      putImageData: mockPutImageData,
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockImplementation(mockToDataURL);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns a data URL string', () => {
    const result = decodeBlurhash('LEHV6nWB2yk8pyo0adR*.7kCMdnj');
    expect(result).toMatch('data:image/png;base64,');
  });

  it('returns consistent output for same input (cache hit)', () => {
    const hash = 'LKO2?U%2Tw=w]~RBVZRi};RPxuwH';
    const first = decodeBlurhash(hash);
    const second = decodeBlurhash(hash);
    expect(first).toBe(second);
    // getContext should only be called once for the same hash (cached)
    expect(mockCreateImageData).toHaveBeenCalledTimes(1);
  });

  it('calls decode with correct dimensions', () => {
    decodeBlurhash('LEHV6nWB2yk8pyo0adR*.7kCMdnj', 16, 16);
    expect(mockCreateImageData).toHaveBeenCalledWith(16, 16);
  });
});
