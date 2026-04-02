// eslint-disable-next-line node/prefer-global/process
const extraMediaHosts = (process.env.EXTRA_MEDIA_HOSTS || '')
  .split(',')
  .map(h => h.trim())
  .filter(Boolean);

const imgSrc = ['\'self\'', 'https:', 'data:', 'blob:', ...extraMediaHosts].join(' ');
const mediaSrc = ['\'self\'', 'https:', 'data:', ...extraMediaHosts].join(' ');
const connectSrc = ['\'self\'', 'https:', 'wss:'].join(' ');

const csp = [
  'default-src \'none\'',
  'script-src \'self\' \'wasm-unsafe-eval\'',
  'style-src \'self\' \'unsafe-inline\'',
  `img-src ${imgSrc}`,
  `media-src ${mediaSrc}`,
  'font-src \'self\'',
  `connect-src ${connectSrc}`,
  'manifest-src \'self\'',
  'base-uri \'self\'',
  'form-action \'self\'',
  'frame-ancestors \'none\'',
  'object-src \'none\'',
  'upgrade-insecure-requests',
].join('; ');

export default defineEventHandler((event) => {
  setResponseHeaders(event, {
    'Content-Security-Policy': csp,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  });
});
