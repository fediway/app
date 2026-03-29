#!/bin/sh
set -e

# Inject runtime environment variables into the built static HTML.
# Nuxt bakes runtimeConfig.public into the HTML at build time.
# This script replaces the build-time default with the runtime value.

if [ -n "$NUXT_PUBLIC_DEFAULT_INSTANCE" ]; then
  find /usr/share/nginx/html -name '*.html' -exec sed -i \
    "s|\"defaultInstance\":\"[^\"]*\"|\"defaultInstance\":\"${NUXT_PUBLIC_DEFAULT_INSTANCE}\"|g" {} +
fi
