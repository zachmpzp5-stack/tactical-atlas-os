# Tactical ATLAS Field Command Mobile

The repository contains Capacitor 8 configuration and a shared mobile bundle path. Native Android and iOS projects must still be generated before platform sync; the browser app opens Headquarters at `/`, while generated native apps open Field Command first.

## Current scope

- Personal, single-commander native shell
- Android project not yet generated (`npm run mobile:add:android`)
- iOS project not yet generated (`npm run mobile:add:ios` on a Mac)
- Native web bundle isolated in `mobile-dist/` so the protected `dist/` folder is not changed
- Mission, approval, readiness, and navigation surfaces optimized for phone use
- No app-store publishing, cloud provisioning, or production deployment

The mobile shell currently calls the Tactical ATLAS API at `/api`. Until a private hosted API is configured, native builds will load safely but report command data as disconnected. Approval actions will remain unavailable rather than pretending to succeed.

## Requirements

- Node.js 22 through 24
- Android: current Android Studio with Android SDK 36
- iOS: a Mac with current Xcode

## Commands

```powershell
npm install
npm run mobile:add:android
npm run mobile:sync
```

For Android:

```powershell
npm run mobile:open:android
```

For iOS, run this on a Mac:

```powershell
npm run mobile:add:ios
npm run mobile:sync:ios
npm run mobile:open:ios
```

After changing React code, run `npm run mobile:sync` before rebuilding in Android Studio. On a Mac, run `npm run mobile:sync:ios` before rebuilding in Xcode.

## Next checkpoint

1. Install Android Studio and Android SDK 36 on the Windows development machine.
2. Add Tactical ATLAS launcher and splash artwork.
3. Configure a private API base URL and authenticated commander session.
4. Build and install a signed personal Android package.
5. Move the iOS project to a Mac for device signing and installation.
