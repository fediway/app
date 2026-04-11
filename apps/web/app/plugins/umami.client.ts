export default defineNuxtPlugin((nuxtApp) => {
  const config = nuxtApp.$config.public as Record<string, string>;
  const url = config.umamiUrl;
  const websiteId = config.umamiWebsiteId;

  if (!url || !websiteId)
    return;

  const script = document.createElement('script');
  script.defer = true;
  script.src = url;
  script.dataset.websiteId = websiteId;
  script.dataset.autoTrack = 'false';
  document.head.appendChild(script);
});
