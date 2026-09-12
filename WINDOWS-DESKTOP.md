# Windows desktop build

Tactical Atlas runs as a hardened Electron shell around the existing loopback-only Node server. The renderer has no Node integration or preload bridge, and the application server binds only to `127.0.0.1`.

## Build artifacts

Use Node.js 24.20.0, then run:

```powershell
npm ci
npm run desktop:installer
npm run desktop:package
```

Artifacts are written to `desktop-release/`:

- `Tactical-Atlas-Setup-4.6.0-x64.exe` — NSIS installer with user-selectable install location plus Desktop and Start Menu shortcuts.
- `Tactical-Atlas-Portable-4.6.0-x64.exe` — portable executable.

## Unsigned-build warning

These local artifacts are not code-signed. Windows SmartScreen can therefore show an “unrecognized app” warning. Verify the artifact came from this local build before choosing **More info → Run anyway**. Do not distribute a release build until it is signed with a trusted Windows code-signing certificate.
