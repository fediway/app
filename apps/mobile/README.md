# Fediway Mobile (Capacitor)

Native iOS and Android app wrapping the Vue 3 web bundle via Capacitor 6.

## Prerequisites

### iOS (macOS only)

- Xcode 15+
- Xcode Command Line Tools — `xcode-select --install`
- CocoaPods — `sudo gem install cocoapods`
- Apple Developer account (free for simulator, $99/year for physical devices)

### Android

- Android Studio with JDK 17 (bundled)
- Android SDK: API 34+, Build-Tools, Emulator, Platform-Tools
- For physical devices: enable Developer Options and USB Debugging

## Setup

Run `npm install` from the monorepo root first, then:

```bash
cd apps/mobile
npm run build
npx cap add ios        # or: npx cap add android
npm run cap:sync
```

## Run

```bash
npm run cap:run:ios        # picks a simulator, builds, launches
npm run cap:open:ios       # opens Xcode for device selection

npm run cap:run:android    # picks emulator or connected device
npm run cap:open:android   # opens Android Studio
```

## Live reload

Edit web code and see changes on the device instantly without rebuilding native.

1. Start the mobile dev server:

```bash
npm run dev:mobile:mock
```

2. Find your LAN IP (`ipconfig getifaddr en0` on macOS, `hostname -I` on Linux).

3. Add to `capacitor.config.ts`:

```
server: {
  url: 'http://YOUR_LAN_IP:5173',
  cleartext: true,
},
```

4. Sync and launch:

```bash
npm run cap:sync
npm run cap:run:ios    # or cap:run:android
```

Remove the `server.url` block before committing.

## Debugging

- **iOS** — Safari > Develop > select device > inspect WebView
- **Android** — `chrome://inspect` > select device under Remote Target
