import { describe, expect, it } from 'vitest';
import { getProfilePath, getStatusPath } from '../../src/utils/paths';

describe('getProfilePath', () => {
  it('builds path from acct', () => {
    expect(getProfilePath('alice@example.com')).toBe('/@alice@example.com');
  });

  it('strips leading @ if present', () => {
    expect(getProfilePath('@alice@example.com')).toBe('/@alice@example.com');
  });

  it('handles local-only acct', () => {
    expect(getProfilePath('alice')).toBe('/@alice');
  });
});

describe('getStatusPath', () => {
  it('builds path from acct and statusId', () => {
    expect(getStatusPath('alice@example.com', '12345')).toBe('/@alice@example.com/12345');
  });

  it('strips leading @ from acct', () => {
    expect(getStatusPath('@alice@example.com', '12345')).toBe('/@alice@example.com/12345');
  });

  it('handles local-only acct', () => {
    expect(getStatusPath('alice', '99')).toBe('/@alice/99');
  });
});
