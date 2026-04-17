export default defineNuxtPlugin(async () => {
  if (!('serviceWorker' in navigator))
    return;

  // Unregister any stale service workers (legacy PWA cleanup),
  // then register the push notification SW.
  const registrations = await navigator.serviceWorker.getRegistrations();
  for (const registration of registrations) {
    if (registration.active?.scriptURL?.endsWith('/push-sw.js'))
      continue;
    await registration.unregister();
  }

  await navigator.serviceWorker.register('/push-sw.js', { scope: '/' });
});
