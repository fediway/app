import type { AccountCredentials, StatusVisibility } from '@repo/types';
import { ref } from 'vue';
import { useAccountStore } from '../auth/account-store';
import { useClient } from './useClient';

export interface AccountPreferencesUpdate {
  locked?: boolean;
  discoverable?: boolean;
  hideCollections?: boolean;
  bot?: boolean;
  indexable?: boolean;
  source?: {
    language?: string;
    privacy?: StatusVisibility;
    sensitive?: boolean;
  };
}

export interface UseAccountPreferencesReturn {
  isSaving: ReturnType<typeof ref<boolean>>;
  update: (patch: AccountPreferencesUpdate) => Promise<boolean>;
}

// Optimistic update: flip currentUser in the store synchronously so the UI
// responds instantly, call the server in the background, and roll back on error.
export function useAccountPreferences(): UseAccountPreferencesReturn {
  const store = useAccountStore();
  const isSaving = ref(false);

  async function update(patch: AccountPreferencesUpdate): Promise<boolean> {
    const prev = store.currentUser.value;
    if (!prev)
      return false;

    // Apply optimistic update
    store.currentUser.value = applyPatch(prev, patch);
    isSaving.value = true;

    try {
      const client = useClient();
      const updated = await client.rest.v1.accounts.updateCredentials(patch);
      store.currentUser.value = updated;
      return true;
    }
    catch {
      store.currentUser.value = prev;
      return false;
    }
    finally {
      isSaving.value = false;
    }
  }

  return { isSaving, update };
}

function applyPatch(user: AccountCredentials, patch: AccountPreferencesUpdate): AccountCredentials {
  const clone = { ...user };
  if (patch.locked !== undefined)
    clone.locked = patch.locked;
  if (patch.discoverable !== undefined)
    (clone as Record<string, unknown>).discoverable = patch.discoverable;
  if (patch.bot !== undefined)
    clone.bot = patch.bot;
  if (patch.hideCollections !== undefined)
    (clone as Record<string, unknown>).hideCollections = patch.hideCollections;
  if (patch.source) {
    clone.source = { ...clone.source, ...patch.source } as AccountCredentials['source'];
  }
  return clone;
}
