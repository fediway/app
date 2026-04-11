export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const url = config.public.umamiUrl;
  const websiteId = config.public.umamiWebsiteId;

  if (!url || !websiteId)
    return;

  const script = document.createElement('script');
  script.defer = true;
  script.src = url;
  script.dataset.websiteId = websiteId;
  document.head.appendChild(script);
});
