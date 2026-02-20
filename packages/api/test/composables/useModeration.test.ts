import type { ModerationError } from '../../src/composables/useModeration';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockClient } from '../../src/mock/client';
import { withSetup } from '../utils/withSetup';

let mockClient: ReturnType<typeof createMockClient>;

vi.mock('../../src/composables/useClient', () => ({
  useClient: () => mockClient,
}));

const { useModeration } = await import('../../src/composables/useModeration');

beforeEach(() => {
  mockClient = createMockClient();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useModeration', () => {
  describe('blockAccount', () => {
    it('returns Relationship with blocking: true', async () => {
      const [mod] = withSetup(() => useModeration());
      const result = await mod.blockAccount('1');
      expect(result).toBeDefined();
      expect(result!.blocking).toBe(true);
      expect(result!.id).toBe('1');
    });

    it('error fires onError with action: block', async () => {
      const origSelect = mockClient.rest.v1.accounts.$select;
      mockClient.rest.v1.accounts.$select = (id: string) => ({
        ...origSelect(id),
        block: async () => { throw new Error('Network error'); },
      });

      const errors: ModerationError[] = [];
      const [mod] = withSetup(() => useModeration({ onError: e => errors.push(e) }));
      const result = await mod.blockAccount('1');

      expect(result).toBeUndefined();
      expect(errors).toHaveLength(1);
      expect(errors[0]!.action).toBe('block');
      expect(errors[0]!.targetId).toBe('1');
      expect(errors[0]!.error.message).toBe('Network error');

      mockClient.rest.v1.accounts.$select = origSelect;
    });
  });

  describe('unblockAccount', () => {
    it('returns Relationship with blocking: false', async () => {
      const [mod] = withSetup(() => useModeration());
      await mod.blockAccount('1');
      const result = await mod.unblockAccount('1');
      expect(result).toBeDefined();
      expect(result!.blocking).toBe(false);
    });
  });

  describe('muteAccount', () => {
    it('with params returns Relationship with muting: true', async () => {
      const [mod] = withSetup(() => useModeration());
      const result = await mod.muteAccount('1', { notifications: true, duration: 3600 });
      expect(result).toBeDefined();
      expect(result!.muting).toBe(true);
    });

    it('without params (defaults) works', async () => {
      const [mod] = withSetup(() => useModeration());
      const result = await mod.muteAccount('2');
      expect(result).toBeDefined();
      expect(result!.muting).toBe(true);
      expect(result!.id).toBe('2');
    });
  });

  describe('unmuteAccount', () => {
    it('returns Relationship with muting: false', async () => {
      const [mod] = withSetup(() => useModeration());
      await mod.muteAccount('1');
      const result = await mod.unmuteAccount('1');
      expect(result).toBeDefined();
      expect(result!.muting).toBe(false);
    });
  });

  describe('muteConversation', () => {
    it('succeeds without error', async () => {
      // Create a status so the mock can find it
      const status = await mockClient.rest.v1.statuses.create({ status: 'test' });
      const [mod] = withSetup(() => useModeration());
      await mod.muteConversation(status.id);
      expect(mod.error.value).toBeNull();
    });
  });

  describe('unmuteConversation', () => {
    it('succeeds without error', async () => {
      const status = await mockClient.rest.v1.statuses.create({ status: 'test' });
      const [mod] = withSetup(() => useModeration());
      await mod.muteConversation(status.id);
      await mod.unmuteConversation(status.id);
      expect(mod.error.value).toBeNull();
    });
  });

  describe('domain blocks', () => {
    it('blockDomain then fetchBlockedDomains includes it', async () => {
      const [mod] = withSetup(() => useModeration());
      await mod.blockDomain('evil.example.com');
      await mod.fetchBlockedDomains();
      expect(mod.blockedDomains.value).toContain('evil.example.com');
    });

    it('unblockDomain then fetchBlockedDomains excludes it', async () => {
      const [mod] = withSetup(() => useModeration());
      await mod.blockDomain('evil.example.com');
      await mod.unblockDomain('evil.example.com');
      await mod.fetchBlockedDomains();
      expect(mod.blockedDomains.value).not.toContain('evil.example.com');
    });
  });

  describe('fetchBlockedAccounts', () => {
    it('returns blocked accounts', async () => {
      const [mod] = withSetup(() => useModeration());
      // Block account '1' (sarah, id '1')
      await mod.blockAccount('1');
      await mod.fetchBlockedAccounts();
      expect(mod.blockedAccounts.value).toHaveLength(1);
      expect(mod.blockedAccounts.value[0]!.id).toBe('1');
    });
  });

  describe('fetchMutedAccounts', () => {
    it('returns muted accounts', async () => {
      const [mod] = withSetup(() => useModeration());
      await mod.muteAccount('1');
      await mod.fetchMutedAccounts();
      expect(mod.mutedAccounts.value).toHaveLength(1);
      expect(mod.mutedAccounts.value[0]!.id).toBe('1');
    });
  });

  describe('isLoading', () => {
    it('true during fetch, false after', async () => {
      const [mod] = withSetup(() => useModeration());
      expect(mod.isLoading.value).toBe(false);
      const promise = mod.fetchBlockedAccounts();
      expect(mod.isLoading.value).toBe(true);
      await promise;
      expect(mod.isLoading.value).toBe(false);
    });
  });

  describe('relationships.fetch reflects block/mute state', () => {
    it('blocking an account is visible via relationships.fetch', async () => {
      const [mod] = withSetup(() => useModeration());
      await mod.blockAccount('2');
      const [rel] = await mockClient.rest.v1.accounts.relationships.fetch({ id: ['2'] });
      expect(rel!.blocking).toBe(true);
      expect(rel!.muting).toBe(false);
    });

    it('muting an account is visible via relationships.fetch', async () => {
      const [mod] = withSetup(() => useModeration());
      await mod.muteAccount('3');
      const [rel] = await mockClient.rest.v1.accounts.relationships.fetch({ id: ['3'] });
      expect(rel!.muting).toBe(true);
      expect(rel!.blocking).toBe(false);
    });

    it('unblocking clears the relationship', async () => {
      const [mod] = withSetup(() => useModeration());
      await mod.blockAccount('1');
      await mod.unblockAccount('1');
      const [rel] = await mockClient.rest.v1.accounts.relationships.fetch({ id: ['1'] });
      expect(rel!.blocking).toBe(false);
    });
  });

  describe('error handling', () => {
    it('error set on failure, cleared on next success', async () => {
      const origSelect = mockClient.rest.v1.accounts.$select;
      mockClient.rest.v1.accounts.$select = (id: string) => ({
        ...origSelect(id),
        block: async () => { throw new Error('fail'); },
      });

      const [mod] = withSetup(() => useModeration());
      await mod.blockAccount('1');
      expect(mod.error.value).toBeTruthy();

      // Restore and do a successful operation
      mockClient.rest.v1.accounts.$select = origSelect;
      await mod.blockAccount('1');
      expect(mod.error.value).toBeNull();
    });
  });
});
