import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

export function useHaptics() {
  async function impact(style: 'light' | 'medium' | 'heavy' = 'light') {
    if (!isNative())
      return;
    const map = { light: ImpactStyle.Light, medium: ImpactStyle.Medium, heavy: ImpactStyle.Heavy };
    await Haptics.impact({ style: map[style] });
  }

  async function notification(type: 'success' | 'warning' | 'error' = 'success') {
    if (!isNative())
      return;
    const map = { success: NotificationType.Success, warning: NotificationType.Warning, error: NotificationType.Error };
    await Haptics.notification({ type: map[type] });
  }

  async function selection() {
    if (!isNative())
      return;
    await Haptics.selectionStart();
    await Haptics.selectionChanged();
    await Haptics.selectionEnd();
  }

  return { impact, notification, selection };
}
