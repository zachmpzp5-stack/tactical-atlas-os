# Tactical Atlas release readiness

This document is preparation only. It does not enable publishing, automatic updates, production deployment, or code signing.

## Windows code signing

Current Windows artifacts are unsigned. Do not describe them as trusted by Windows and keep the SmartScreen warning in `WINDOWS-DESKTOP.md` until a legitimate certificate is configured.

Electron Builder 26.15.3 accepts a Windows Authenticode certificate as a PKCS#12 `.p12` or `.pfx` file through `WIN_CSC_LINK` (falling back to `CSC_LINK`) and its password through `WIN_CSC_KEY_PASSWORD` (falling back to `CSC_KEY_PASSWORD`). Keep both values in the CI secret store; never commit the certificate, password, or base64 certificate data. Hardware-backed or cloud-backed EV certificates require a Windows signing runner and provider-specific secure key access instead of exporting a private key.

A standard organization-validated Authenticode certificate is appropriate for an initial signed personal release. EV signing can provide stronger publisher vetting and may build reputation differently, but it is not a substitute for release controls. Use the certificate type supported by the legitimate certificate authority and private-key custody model.

Timestamp every signature with an RFC 3161 timestamp service so a valid signature remains verifiable after certificate expiry. Electron Builder supports `signtoolOptions.rfc3161TimeStampServer`; its pinned implementation defaults to DigiCert when online. Production CI should set the approved HTTPS timestamp URL explicitly and fail the release if signing or timestamping fails.

Electron Builder signs the unpacked application executable, NSIS uninstaller, NSIS installer, and portable executable during their builds. Verify every final artifact on Windows:

```powershell
Get-AuthenticodeSignature '.\desktop-release\win-unpacked\Tactical Atlas.exe' | Format-List Status,StatusMessage,SignerCertificate,TimeStamperCertificate
Get-AuthenticodeSignature '.\desktop-release\Tactical-Atlas-Setup-4.6.0-x64.exe' | Format-List Status,StatusMessage,SignerCertificate,TimeStamperCertificate
Get-AuthenticodeSignature '.\desktop-release\Tactical-Atlas-Portable-4.6.0-x64.exe' | Format-List Status,StatusMessage,SignerCertificate,TimeStamperCertificate
signtool verify /pa /all /v '.\desktop-release\Tactical-Atlas-Setup-4.6.0-x64.exe'
signtool verify /pa /all /v '.\desktop-release\Tactical-Atlas-Portable-4.6.0-x64.exe'
```

A release job should run on an isolated Windows runner with read-only source permissions, inject signing secrets only into the packaging step, verify signatures and SHA-256 hashes, then publish immutable artifacts. Pull-request jobs must never receive signing credentials.

## Update strategy

Use manual installer updates initially. Publish a versioned installer and portable executable only after legitimate signing is available, include SHA-256 hashes, retain the prior signed installer for rollback, and require the operator to initiate installation.

GitHub Releases is a suitable future distribution channel for public, non-secret signed artifacts. It is not an authorization boundary and no GitHub token belongs in the renderer. Do not add `electron-updater` yet: the current app has no signed release channel, no rollback workflow, and no update UX or tests.

A future updater checkpoint must:

- download metadata and artifacts only over HTTPS;
- accept only a newer, legitimately signed Tactical Atlas release;
- fail closed on signer mismatch, invalid signature, hash mismatch, malformed metadata, or network failure;
- keep release credentials server-side or in CI, never in the renderer;
- require explicit operator confirmation before install;
- preserve local application data and document migration/rollback behavior;
- retain a recovery installer and test interrupted download/install behavior;
- avoid changing Guardian, LYRA, TAIN, or tool authorization paths.

## Web/API deployment

No production deployment is authorized by this readiness work.

The Windows app can serve its bundled UI and local read-only API from its loopback-only server without cloud credentials. Persistent missions, TAIN, approvals, conversations, integrations, and audit data require `DATABASE_URL`. Commander authentication requires `COMMANDER_AUTH_KEY` and `COMMANDER_SESSION_SECRET`. Account linking requires `ATLAS_PUBLIC_URL`, `ATLAS_TOKEN_ENCRYPTION_KEY`, and `ATLAS_TOKEN_ENCRYPTION_KEY_ID`, plus provider-specific server credentials. Production rate limiting and Vercel token storage require `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.

Model generation uses `ATLAS_AI_PROVIDER`, `ATLAS_AI_MODEL`, and either Vercel-provided `VERCEL_OIDC_TOKEN` or server-only `AI_GATEWAY_API_KEY`. Voice uses `LYRA_VOICE_PROVIDER`, `LYRA_VOICE_API_KEY`, `LYRA_VOICE_ID`, and `LYRA_VOICE_MODEL`. Provider-neutral storage uses `OBJECT_STORAGE_URL` and `OBJECT_STORAGE_TOKEN` when configured.

Disposable integration testing is separate from deployment. It uses only `ATLAS_TEST_DATABASE_URL` together with `ATLAS_TEST_DATABASE_CONFIRM=DISPOSABLE_PERSONAL_TACTICAL_ATLAS`; the test refuses non-Neon targets, ambiguous database names, and non-empty schemas.

When configuration is absent, database-backed APIs return `NOT_CONFIGURED` or `503`, TAIN returns no fabricated records, and mobile private-API actions remain disconnected. Health endpoints expose state names, never secret values. No server credential may use a `VITE_` prefix or be bundled into the packaged renderer.

## React Router advisories

The locked `react-router-dom` and transitive `react-router` versions are 6.30.6. The production audit reports two moderate advisories across React Router 6.0.0–7.17.0:

- `GHSA-wrjc-x8rr-h8h6`: open redirect through backslash handling in `<Link>` and `useNavigate`;
- `GHSA-337j-9hxr-rhxg`: constructor injection in SSR hydration error deserialization.

Tactical Atlas uses client-side `BrowserRouter`, `<Link>`, and `useNavigate`; it does not use React Router SSR hydration or `deserializeErrors`, so the second path is not currently exercised. The first primitive is present, but current destinations are fixed internal routes or URL-encoded search text rather than untrusted absolute destinations. Treat this as reduced exposure, not remediation.

The available audited fix is `react-router-dom` 7.18.3, a semver-major upgrade. Perform it as a separate checkpoint. Migration tests must cover every route, redirects, BrowserRouter fallback, search navigation, lazy loading, desktop loopback navigation, mobile entry routing, and rejection of backslash/external navigation inputs. Do not use `npm audit fix --force` in unrelated work.
