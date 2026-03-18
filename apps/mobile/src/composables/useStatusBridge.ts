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

  let actions: ReturnType<typeof useStatusActions> | null = null;

  function getActions() {
    if (!actions) {
      try {
        actions = useStatusActions({
          onError: () => notification('error'),
        });
      }
      catch {
        return null;
      }
    }
    return actions;
  }

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
    await getActions()?.toggleFavourite(id);
  }

  async function toggleReblog(id: string) {
    impact('medium');
    await getActions()?.toggleReblog(id);
  }

  async function toggleBookmark(id: string) {
    impact('light');
    await getActions()?.toggleBookmark(id);
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
