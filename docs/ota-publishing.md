# Android UAT OTA updates

The Reader Android build requests updates from the XPRem app `d38d088f-1137-4b11-8b0d-c7285af1a1b2` using channel `UAT`. In XPRem, that channel must point to the `uat` branch.
Both the UAT APK build and UAT OTA publisher embed `https://libraryapi.ditest.in/api` as the Reader API URL, regardless of local development settings.

## Build the UAT app

Create a local standalone Android UAT APK. This uses the project Gradle wrapper and does not require EAS login:

```sh
npm run build:android:apk:uat
```

Install `build/uat/android/apk/library-reader-uat.apk` before publishing the first OTA update. This test APK targets arm64 Android devices. The build script preserves the previous release APK at `build/uat/android/apk/pre-ota-app-release.apk` before Gradle replaces its standard output. Updates apply to binaries with the same app version (`1.0.0` for this build); native dependency or native configuration changes require a version bump and a new Android build.

## Publish an Android update

Keep `EOO_TOKEN` in the ignored `.env` file, then run:

```sh
npm run ota:publish:uat
```

The script pins `eoas` to `3.2.6`, sets `DEBUG=false` for CLI startup, selects the Reader variant, exports Android only, and publishes to branch `uat` with release channel `uat`. It permits a dirty worktree, matching QuickTag's workflow.

## Roll back

Use the rollback command only after confirming the target update in XPRem:

```sh
npm run ota:rollback:uat
```

The script loads `EOO_TOKEN` from the ignored `.env` file and rolls back Android updates on branch `uat`.
