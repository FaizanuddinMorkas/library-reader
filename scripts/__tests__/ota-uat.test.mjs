import assert from "node:assert/strict";
import test from "node:test";
import {
  createUatBuildSpec,
  validateUatExpoConfig,
  validateUatNativeManifest,
} from "../build-android-uat.mjs";
import { createXpRemPublishInvocation } from "../ota-publish-config.mjs";

test("UAT APK build pins the Reader app, UAT channel, and arm64 test device", () => {
  const spec = createUatBuildSpec("/tmp/library-reader", {
    APP_VARIANT: "kiosk",
    OTA_CHANNEL: "production",
    EXPO_PUBLIC_API_BASE_URL: "http://localhost:3000/api",
  });

  assert.equal(spec.env.APP_VARIANT, "reader");
  assert.equal(spec.env.OTA_CHANNEL, "UAT");
  assert.equal(spec.env.EXPO_PUBLIC_API_BASE_URL, "https://libraryapi.ditest.in/api");
  assert.equal(spec.env.EXPO_NO_DOTENV, "1");
  assert.ok(spec.gradleArgs.includes("-PreactNativeArchitectures=arm64-v8a"));
  assert.equal(spec.outputApk, "/tmp/library-reader/build/uat/android/apk/library-reader-uat.apk");
  assert.equal(spec.preservedApk, "/tmp/library-reader/build/uat/android/apk/pre-ota-app-release.apk");
  assert.equal(spec.generatedUpdatesAssets, "/tmp/library-reader/android/app/build/generated/assets/createReleaseUpdatesResources");
});

test("UAT APK preflight rejects an OTA config that does not target the Reader UAT app", () => {
  assert.throws(
    () => validateUatExpoConfig({
      runtimeVersion: "1.0.0",
      updates: {
        enabled: true,
        url: "https://updates.quicktag.in/manifest",
        codeSigningCertificate: "./certificate.txt",
        requestHeaders: {
          "expo-app-id": "wrong-app",
          "expo-channel-name": "UAT",
        },
      },
    }),
    /XPRem app ID/,
  );
});

test("valid UAT config accepts the standard Expo app and channel headers", () => {
  const updates = validateUatExpoConfig({
    runtimeVersion: "1.0.0",
    updates: {
      enabled: true,
      url: "https://updates.quicktag.in/manifest",
      codeSigningCertificate: "./certificate.txt",
      requestHeaders: {
        "expo-app-id": "d38d088f-1137-4b11-8b0d-c7285af1a1b2",
        "expo-channel-name": "UAT",
      },
    },
  });

  assert.equal(updates.enabled, true);
});

test("UAT preflight rejects a runtime fingerprint", () => {
  assert.throws(() => validateUatExpoConfig({
    runtimeVersion: { policy: "fingerprint" },
    updates: {
      enabled: true,
      url: "https://updates.quicktag.in/manifest",
      codeSigningCertificate: "./certificate.txt",
      requestHeaders: {
        "expo-app-id": "d38d088f-1137-4b11-8b0d-c7285af1a1b2",
        "expo-channel-name": "UAT",
      },
    },
  }), /runtime version/);
});

test("UAT preflight rejects stale headers in the generated Android manifest", () => {
  const updates = {
    enabled: true,
    url: "https://updates.quicktag.in/manifest",
    requestHeaders: {
      "expo-channel-name": "UAT",
      "expo-app-id": "d38d088f-1137-4b11-8b0d-c7285af1a1b2",
    },
  };
  const manifest = '<meta-data android:name="expo.modules.updates.UPDATES_CONFIGURATION_REQUEST_HEADERS_KEY" android:value="{&quot;expo-channel-name&quot;:&quot;UAT&quot;,&quot;expo-app-id&quot;:&quot;d38d088f-1137-4b11-8b0d-c7285af1a1b2&quot;,&quot;xprem-branch&quot;:&quot;&quot;}"/>';

  assert.throws(() => validateUatNativeManifest(manifest, updates), /native OTA request headers/);
});

test("XPRem UAT publish disables CLI debug parsing and permits dirty worktrees", () => {
  const invocation = createXpRemPublishInvocation({
    EOO_TOKEN: "test-token",
    EXPO_PUBLIC_API_BASE_URL: "http://localhost:3000/api",
  });

  assert.equal(invocation.command, "npx");
  assert.ok(invocation.args.includes("eoas@3.2.6"));
  assert.ok(invocation.args.includes("--branch"));
  assert.ok(invocation.args.includes("uat"));
  assert.ok(invocation.args.includes("--disableRepositoryCheck"));
  assert.ok(invocation.args.includes("--nonInteractive"));
  assert.equal(invocation.env.DEBUG, "false");
  assert.equal(invocation.env.EXPO_PUBLIC_API_BASE_URL, "https://libraryapi.ditest.in/api");
  assert.equal(invocation.env.EXPO_NO_DOTENV, "1");
});
