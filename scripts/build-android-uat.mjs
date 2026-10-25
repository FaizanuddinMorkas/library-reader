import { existsSync, mkdirSync, copyFileSync, readFileSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

const require = createRequire(import.meta.url);

export const XP_REM_APP_ID = "d38d088f-1137-4b11-8b0d-c7285af1a1b2";
export const XP_REM_UPDATE_URL = "https://updates.quicktag.in/manifest";
export const UAT_API_BASE_URL = "https://libraryapi.ditest.in/api";
const UAT_RUNTIME_VERSION = require("../app.json").expo.version;

export function createUatBuildSpec(projectRoot, currentEnv = process.env) {
  const outputDirectory = resolve(projectRoot, "build/uat/android/apk");

  return {
    env: {
      ...currentEnv,
      APP_VARIANT: "reader",
      OTA_CHANNEL: "UAT",
      EXPO_PUBLIC_API_BASE_URL: UAT_API_BASE_URL,
      EXPO_NO_DOTENV: "1",
    },
    gradleArgs: [
      "assembleRelease",
      "-PreactNativeArchitectures=arm64-v8a",
      "-x",
      "lintVitalAnalyzeRelease",
      "--no-daemon",
      "-Dorg.gradle.jvmargs=-Xmx3g -XX:MaxMetaspaceSize=1g",
    ],
    generatedApk: resolve(projectRoot, "android/app/build/outputs/apk/release/app-release.apk"),
    generatedUpdatesAssets: resolve(projectRoot, "android/app/build/generated/assets/createReleaseUpdatesResources"),
    outputApk: resolve(outputDirectory, "library-reader-uat.apk"),
    preservedApk: resolve(outputDirectory, "pre-ota-app-release.apk"),
  };
}

export function validateUatExpoConfig(expoConfig) {
  const updates = expoConfig?.updates;
  const headers = updates?.requestHeaders ?? {};

  if (expoConfig?.runtimeVersion !== UAT_RUNTIME_VERSION) {
    throw new Error(`The UAT Android runtime version must match app version ${UAT_RUNTIME_VERSION}.`);
  }

  if (!updates?.enabled) {
    throw new Error("Expo Updates must be enabled in the UAT Android build.");
  }
  if (updates.url !== XP_REM_UPDATE_URL) {
    throw new Error("The UAT Android build must use the XPRem update URL.");
  }
  if (headers["expo-app-id"] !== XP_REM_APP_ID) {
    throw new Error("The UAT Android build must use the configured XPRem app ID.");
  }
  if (headers["expo-channel-name"] !== "UAT") {
    throw new Error("The UAT Android build must use the UAT update channel.");
  }
  if (!updates.codeSigningCertificate) {
    throw new Error("The UAT Android build must include the XPRem signing certificate.");
  }

  return updates;
}

export function validateUatNativeManifest(manifestXml, updates) {
  function metadataValue(name) {
    const escapedName = name.replaceAll(".", "\\.");
    const entry = manifestXml.match(new RegExp(`<meta-data[^>]*android:name="${escapedName}"[^>]*android:value="([^"]*)"`));
    return entry?.[1]?.replaceAll("&quot;", '"').replaceAll("&amp;", "&");
  }

  let nativeHeaders;
  try {
    nativeHeaders = JSON.parse(metadataValue("expo.modules.updates.UPDATES_CONFIGURATION_REQUEST_HEADERS_KEY"));
  } catch {
    throw new Error("AndroidManifest.xml has invalid native OTA request headers.");
  }

  const expectedHeaders = updates.requestHeaders;
  if (Object.keys(nativeHeaders).length !== Object.keys(expectedHeaders).length ||
      Object.entries(expectedHeaders).some(([key, value]) => nativeHeaders[key] !== value)) {
    throw new Error("AndroidManifest.xml native OTA request headers differ from app.config.js.");
  }
  if (metadataValue("expo.modules.updates.EXPO_UPDATE_URL") !== updates.url ||
      metadataValue("expo.modules.updates.ENABLED") !== "true") {
    throw new Error("AndroidManifest.xml native OTA URL or enabled setting differs from app.config.js.");
  }
}

function runBuild(projectRoot, { preflightOnly = false } = {}) {
  const spec = createUatBuildSpec(projectRoot);
  process.env.APP_VARIANT = spec.env.APP_VARIANT;
  process.env.OTA_CHANNEL = spec.env.OTA_CHANNEL;
  process.env.EXPO_PUBLIC_API_BASE_URL = spec.env.EXPO_PUBLIC_API_BASE_URL;
  process.env.EXPO_NO_DOTENV = spec.env.EXPO_NO_DOTENV;
  const expoConfig = require(resolve(projectRoot, "app.config.js")).expo;
  const updates = validateUatExpoConfig(expoConfig);
  const androidManifest = readFileSync(resolve(projectRoot, "android/app/src/main/AndroidManifest.xml"), "utf8");
  validateUatNativeManifest(androidManifest, updates);
  const androidStrings = readFileSync(resolve(projectRoot, "android/app/src/main/res/values/strings.xml"), "utf8");
  if (!androidStrings.includes(`<string name="expo_runtime_version">${expoConfig.runtimeVersion}</string>`)) {
    throw new Error("Android's native OTA runtime version differs from app.config.js.");
  }
  const certificatePath = resolve(projectRoot, updates.codeSigningCertificate);

  if (!existsSync(certificatePath)) {
    throw new Error(`XPRem signing certificate not found: ${updates.codeSigningCertificate}`);
  }

  if (preflightOnly) {
    console.log("[android-uat] Reader UAT OTA configuration and certificate validated.");
    return;
  }

  mkdirSync(dirname(spec.outputApk), { recursive: true });
  if (existsSync(spec.generatedApk) && !existsSync(spec.preservedApk)) {
    copyFileSync(spec.generatedApk, spec.preservedApk);
    console.log(`[android-uat] Preserved the previous release APK at ${spec.preservedApk}`);
  }

  // Expo's Gradle task does not track app config and JavaScript changes as inputs.
  rmSync(spec.generatedUpdatesAssets, { recursive: true, force: true });

  console.log("[android-uat] Building an arm64 UAT release APK for the connected test device.");
  const result = spawnSync("./gradlew", spec.gradleArgs, {
    cwd: resolve(projectRoot, "android"),
    env: spec.env,
    stdio: "inherit",
  });

  if (result.error) {
    throw new Error(`Could not start Gradle: ${result.error.message}`);
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
  if (!existsSync(spec.generatedApk)) {
    throw new Error(`Gradle completed without producing ${spec.generatedApk}`);
  }

  copyFileSync(spec.generatedApk, spec.outputApk);
  console.log(`[android-uat] UAT APK ready: ${spec.outputApk}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  try {
    runBuild(projectRoot, { preflightOnly: process.argv.includes("--preflight-only") });
  } catch (error) {
    console.error(`[android-uat] ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}
