import { describe, expect, it } from 'vitest';
import {
  FediwayAPIError,
  FediwayNetworkError,
  isFediwayAPIError,
  isFediwayNetworkError,
} from '../src/errors';

describe('fediwayAPIError', () => {
  it('sets properties from constructor', () => {
    const err = new FediwayAPIError({
      status: 404,
      type: 'not_found',
      code: 'RECORD_NOT_FOUND',
      message: 'Not found',
    });

    expect(err.status).toBe(404);
    expect(err.type).toBe('not_found');
    expect(err.code).toBe('RECORD_NOT_FOUND');
    expect(err.message).toBe('Not found');
    expect(err.name).toBe('FediwayAPIError');
  });

  it('extends Error', () => {
    const err = new FediwayAPIError({ status: 500, message: 'fail' });
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(FediwayAPIError);
  });

  it('defaults type and code to "unknown"', () => {
    const err = new FediwayAPIError({ status: 500, message: 'fail' });
    expect(err.type).toBe('unknown');
    expect(err.code).toBe('unknown');
  });

  it('isUnauthorized returns true for 401', () => {
    const err = new FediwayAPIError({ status: 401, message: 'Unauthorized' });
    expect(err.isUnauthorized).toBe(true);
    expect(err.isNotFound).toBe(false);
    expect(err.isRateLimit).toBe(false);
  });

  it('isNotFound returns true for 404', () => {
    const err = new FediwayAPIError({ status: 404, message: 'Not found' });
    expect(err.isNotFound).toBe(true);
    expect(err.isUnauthorized).toBe(false);
  });

  it('isRateLimit returns true for 429', () => {
    const err = new FediwayAPIError({ status: 429, message: 'Too many requests' });
    expect(err.isRateLimit).toBe(true);
    expect(err.isUnauthorized).toBe(false);
  });

  it('all getters false for generic status', () => {
    const err = new FediwayAPIError({ status: 500, message: 'Server error' });
    expect(err.isUnauthorized).toBe(false);
    expect(err.isNotFound).toBe(false);
    expect(err.isRateLimit).toBe(false);
  });
});

describe('fediwayNetworkError', () => {
  it('sets message and cause', () => {
    const cause = new TypeError('fetch failed');
    const err = new FediwayNetworkError('Network request failed', cause);
    expect(err.message).toBe('Network request failed');
    expect(err.cause).toBe(cause);
    expect(err.name).toBe('FediwayNetworkError');
  });

  it('extends Error', () => {
    const err = new FediwayNetworkError('fail');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(FediwayNetworkError);
  });

  it('works without a cause', () => {
    const err = new FediwayNetworkError('fail');
    expect(err.cause).toBeUndefined();
  });
});

describe('type guards', () => {
  it('isFediwayAPIError identifies API errors', () => {
    const err = new FediwayAPIError({ status: 500, message: 'fail' });
    expect(isFediwayAPIError(err)).toBe(true);
  });

  it('isFediwayAPIError rejects plain Error', () => {
    expect(isFediwayAPIError(new Error('other'))).toBe(false);
  });

  it('isFediwayAPIError rejects null and undefined', () => {
    expect(isFediwayAPIError(null)).toBe(false);
    expect(isFediwayAPIError(undefined)).toBe(false);
  });

  it('isFediwayAPIError rejects FediwayNetworkError', () => {
    expect(isFediwayAPIError(new FediwayNetworkError('fail'))).toBe(false);
  });

  it('isFediwayNetworkError identifies network errors', () => {
    const err = new FediwayNetworkError('fail');
    expect(isFediwayNetworkError(err)).toBe(true);
  });

  it('isFediwayNetworkError rejects plain Error', () => {
    expect(isFediwayNetworkError(new Error('other'))).toBe(false);
  });

  it('isFediwayNetworkError rejects FediwayAPIError', () => {
    expect(isFediwayNetworkError(new FediwayAPIError({ status: 500, message: 'fail' }))).toBe(false);
  });
});
