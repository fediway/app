const csp = [
  'default-src \'none\'',
  'script-src \'self\' \'wasm-unsafe-eval\'',
  'style-src \'self\' \'unsafe-inline\'',
  'img-src \'self\' https: data: blob:',
  'media-src \'self\' https: data:',
  'font-src \'self\'',
  'connect-src \'self\' https: wss:',
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
