export default defineNuxtPlugin(async () => {
  if (!('serviceWorker' in navigator))
    return;

  const registrations = await navigator.serviceWorker.getRegistrations();
  for (const registration of registrations) {
    await registration.unregister();
  }
});
