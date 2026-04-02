import { makeStatus } from '@repo/config/vitest/helpers';
import { beforeEach, describe, expect, it } from 'vitest';
import { useMobileReplyTarget } from '../useMobileReplyTarget';

let target: ReturnType<typeof useMobileReplyTarget>;

beforeEach(() => {
  target = useMobileReplyTarget();
  target.clear();
});

describe('useMobileReplyTarget', () => {
  it('starts with no reply target', () => {
    expect(target.replyTarget.value).toBeNull();
  });

  it('sets a reply target', () => {
    const status = makeStatus('1', {
      account: { acct: 'alice@example.com' } as any,
    });
    target.set(status);
    expect(target.replyTarget.value).toBe(status);
  });

  it('clears the reply target', () => {
    const status = makeStatus('1');
    target.set(status);
    target.clear();
    expect(target.replyTarget.value).toBeNull();
  });

  it('shares state across instances', () => {
    const status = makeStatus('2');
    target.set(status);

    const other = useMobileReplyTarget();
    expect(other.replyTarget.value).toBe(status);
  });
});
