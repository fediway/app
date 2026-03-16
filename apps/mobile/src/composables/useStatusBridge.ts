import type { MastoClient } from '@repo/api';
import type { FediwayStatus, Status } from '@repo/types';
import type { ShallowRef } from 'vue';
import { useClient, useStatusActions, useStatusStore } from '@repo/api';
import { computed, watchEffect } from 'vue';
import { useHaptics } from './useHaptics';

export function getSafeClient(): MastoClient | null {
  try {
    return useClient();
  }
  catch {
    return null;
  }
}

export function useStatusBridge(source: ShallowRef<Status[]> | ShallowRef<Status[] | undefined>) {
  const store = useStatusStore();
  const { impact, notification } = useHaptics();

  const actions = useStatusActions({
    onError: () => {
      notification('error');
    },
  });

  // Populate store when source data arrives
  watchEffect(() => {
    const items = source.value;
    if (items && items.length > 0) {
      store.setMany(items as FediwayStatus[]);
    }
  });

  // Display: merge source structure with store's optimistic state
  const statuses = computed(() =>
    (source.value ?? []).map(s => (store.get(s.id) as Status) ?? s),
  );

  async function toggleFavourite(id: string) {
    impact('light');
    await actions.toggleFavourite(id);
  }

  async function toggleReblog(id: string) {
    impact('medium');
    await actions.toggleReblog(id);
  }

  async function toggleBookmark(id: string) {
    impact('light');
    await actions.toggleBookmark(id);
  }

  return {
    statuses,
    toggleFavourite,
    toggleReblog,
    toggleBookmark,
  };
}

const LEADING_AT_RE = /^@/;

export function getProfileUrl(acct: string): string {
  return `/@${acct.replace(LEADING_AT_RE, '')}`;
}
