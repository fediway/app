import type { mastodon } from 'masto';
import type { ComputedRef, Ref, ShallowRef } from 'vue';
import { computed, ref, shallowRef } from 'vue';
import { useClient } from './useClient';

export type PushAlerts = mastodon.v1.WebPushSubscriptionAlerts;
export type PushPolicy = mastodon.v1.WebPushSubscriptionPolicy;

export interface UsePushSubscriptionReturn {
  isSupported: ComputedRef<boolean>;
  isEnabled: Ref<boolean>;
  isLoading: Ref<boolean>;
  alerts: ShallowRef<Partial<PushAlerts> | null>;
  policy: Ref<PushPolicy>;
  enable: () => Promise<boolean>;
  disable: () => Promise<boolean>;
  updateAlerts: (patch: Partial<PushAlerts>) => Promise<boolean>;
}

const DEFAULT_ALERTS: Partial<PushAlerts> = {
  mention: true,
  follow: true,
  reblog: true,
  favourite: true,
  poll: true,
  status: false,
  update: false,
};

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from(rawData, char => char.charCodeAt(0));
}

export function usePushSubscription(): UsePushSubscriptionReturn {
  const client = useClient();

  const isSupported = computed(() =>
    typeof window !== 'undefined'
    && 'serviceWorker' in navigator
    && 'PushManager' in window
    && 'Notification' in window,
  );

  const isEnabled = ref(false);
  const isLoading = ref(false);
  const alerts = shallowRef<Partial<PushAlerts> | null>(null);
  const policy = ref<PushPolicy>('all');

  // Sync state from server on init
  async function syncFromServer(): Promise<void> {
    try {
      const sub = await client.rest.v1.push.subscription.fetch();
      isEnabled.value = true;
      alerts.value = sub.alerts ?? null;
      policy.value = sub.policy ?? 'all';
    }
    catch {
      isEnabled.value = false;
      alerts.value = null;
    }
  }

  if (typeof window !== 'undefined') {
    syncFromServer();
  }

  async function getVapidKey(): Promise<string | null> {
    try {
      const instance = await client.rest.v2.instance.fetch();
      return instance?.configuration?.vapid?.publicKey ?? null;
    }
    catch {
      return null;
    }
  }

  async function enable(): Promise<boolean> {
    if (!isSupported.value)
      return false;

    isLoading.value = true;
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted')
        return false;

      const vapidKey = await getVapidKey();
      if (!vapidKey)
        return false;

      const registration = await navigator.serviceWorker.ready;
      const browserSub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey).buffer as ArrayBuffer,
      });

      const json = browserSub.toJSON();
      const p256dh = json.keys?.p256dh;
      const auth = json.keys?.auth;
      if (!json.endpoint || !p256dh || !auth)
        return false;

      const serverSub = await client.rest.v1.push.subscription.create({
        subscription: {
          endpoint: json.endpoint,
          keys: { p256dh, auth },
        },
        data: { alerts: DEFAULT_ALERTS },
        policy: policy.value,
      });

      isEnabled.value = true;
      alerts.value = serverSub.alerts ?? DEFAULT_ALERTS;
      policy.value = serverSub.policy ?? 'all';
      return true;
    }
    catch {
      return false;
    }
    finally {
      isLoading.value = false;
    }
  }

  async function disable(): Promise<boolean> {
    isLoading.value = true;
    try {
      await client.rest.v1.push.subscription.remove();

      const registration = await navigator.serviceWorker.ready;
      const browserSub = await registration.pushManager.getSubscription();
      if (browserSub)
        await browserSub.unsubscribe();

      isEnabled.value = false;
      alerts.value = null;
      return true;
    }
    catch {
      return false;
    }
    finally {
      isLoading.value = false;
    }
  }

  async function updateAlerts(patch: Partial<PushAlerts>): Promise<boolean> {
    const merged = { ...alerts.value, ...patch };
    const prev = alerts.value;
    alerts.value = merged;

    try {
      await client.rest.v1.push.subscription.update({
        data: { alerts: merged },
      });
      return true;
    }
    catch {
      alerts.value = prev;
      return false;
    }
  }

  return {
    isSupported,
    isEnabled,
    isLoading,
    alerts,
    policy,
    enable,
    disable,
    updateAlerts,
  };
}
