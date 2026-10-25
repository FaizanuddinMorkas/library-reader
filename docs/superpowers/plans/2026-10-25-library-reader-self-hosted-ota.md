# Library Reader Self-Hosted OTA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task by task after approval.

**Goal:** Enable self-hosted XPRem OTA for the Library Reader Android UAT build. Kiosk, production publishing, and iOS delivery are deferred.

**Architecture:** Use xprem, formerly Expo Open OTA, as the Updates protocol server; do not deploy another server. Use app UUID `d38d088f-1137-4b11-8b0d-c7285af1a1b2`, with channel `UAT` mapped to branch `uat`. Configure the dynamic Expo app config and Android native project, embed the signing certificate, and use the fingerprint runtime policy. Keep publishing tokens out of source control. Kiosk, production publishing, and iOS delivery are deferred.

**Tech Stack:** Expo SDK 57, `expo-updates`, Android Gradle project, EAS Build profiles, xprem v3 deployment, xprem `eoas` CLI.

**Spec:** This implementation plan; no separate feature spec exists.

## Global Constraints

- Follow `library-reader/AGENTS.md`: read the exact Expo SDK 57 docs before writing app code.
- Preserve existing uncommitted work in `library-reader` and `libraryos`; inspect diffs before editing and limit changes to OTA configuration and release tooling.
- Keep the existing xprem deployment and its storage/delivery settings; no server migration or infrastructure rewrite is part of this work.
- Keep app publish tokens in the ignored `library-reader/.env` file and out of logs; `.env` is already ignored by Git. The public signing certificate may be committed, but private signing material must not be.
- OTA updates may only change JavaScript/assets compatible with the installed native binary; native changes require a new store/internal build.
- Use xprem Community features only; no paid or Enterprise functionality.

## Review Focus

- Reader and Kiosk Android builds must resolve to the correct xprem app identity and channel; inspect resolved Expo config for all six EAS profiles.
- An update with a mismatched runtime must not be served to an installed binary; verify runtime versions on native build and manifest.
- A manifest with an invalid signature must be rejected; verify signing certificate/configuration against each xprem app registration.
- Publishing must fail without the expected app token and must not expose it in command output or repository files.
- OTA delivery must work through the public update host and asset path, not an internal Docker-only storage hostname.

---

### Task 1: Register the Library apps in the existing xprem service

**Files:**
- No repository files.

**Interfaces:**
- Consumes: `app-d38d088f-1137-4b11-8b0d-c7285af1a1b2-certificate.txt`, whose filename identifies xprem app UUID `d38d088f-1137-4b11-8b0d-c7285af1a1b2`.
- Produces: confirmed Reader/Kiosk xprem app UUIDs, matching signing certificate path(s), API tokens, and server base URL; separate production and preview channel names mapped to their branches.

- [x] Verify the XPRem public health endpoint and Android manifest path.
- [x] Use the existing app UUID `d38d088f-1137-4b11-8b0d-c7285af1a1b2` and validate the supplied public certificate.
- [x] Use the user-provided `UAT` channel and `uat` branch mapping; a live Android manifest request returns HTTP 200 with `noUpdateAvailable`.
- [x] Keep the `EOO_TOKEN` in the ignored `.env` file; do not include its value in docs or logs.

### Task 2: Configure Expo Updates for both app variants

**Files:**
- Modify: `app.config.js`
- Modify: `app.json`
- Modify: `package.json`
- Modify: `package-lock.json`
- Use: `app-d38d088f-1137-4b11-8b0d-c7285af1a1b2-certificate.txt`; add another public certificate only if a separate app registration requires one.

**Interfaces:**
- Consumes: the app UUIDs, public certificates, host URL, and channel names from Task 1.
- Produces: a resolved Expo config for each app/build profile with `expo-updates`, update URL, correct xprem app ID header, channel, runtime version, and code-signing metadata.

- [ ] Read the SDK 57 Expo Updates and app config docs and xprem's app configuration guide before editing.
- [x] Add SDK 57 compatible `expo-updates` and update the lockfile.
- [x] Configure Reader Android updates URL, app ID, UAT channel, certificate, code-signing metadata, and fingerprint runtime policy.
- [x] Apply the generated OTA metadata to the checked-in Android manifest/resources without regenerating unrelated native files.
- [x] Configure Android preview EAS build environment for Reader/UAT.
- [x] Validate the Android release manifest task with Gradle.

### Task 3: Add a reproducible publish workflow

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json` (only if an npm package/script change requires it)
- Create or modify: `.gitignore` (only the exact local token/config paths needed)
- Create: `docs/ota-publishing.md`

**Interfaces:**
- Consumes: Task 2's resolved app config and Task 1's publish tokens.
- Produces: documented preview and production publish commands that explicitly select the app variant, channel, and branch.

- [x] Add pinned `eoas` Android UAT publish and rollback scripts; load `EOO_TOKEN` from the ignored `.env` without echoing it.
- [x] Document UAT build, publish, rollback, and native-change rebuild requirements.

### Task 4: Verify native builds and OTA delivery

**Files:**
- No additional files unless verification finds a configuration defect.

**Interfaces:**
- Consumes: Tasks 1–3.
- Produces: evidence that Reader and Kiosk native binaries receive the expected signed update from xprem.

- [x] Verify the UAT Android manifest response through the public host; it resolves successfully with no update currently published.
- [ ] Build and install the Android UAT binary on a device.
- [ ] Publish a harmless UAT JavaScript change and verify download, signature validation, and application after restart.
- [ ] Verify runtime mismatch handling, rollback, and public asset delivery on device.
