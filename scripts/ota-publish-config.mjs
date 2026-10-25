export function createXpRemPublishInvocation(currentEnv = process.env) {
  return {
    command: "npx",
    args: [
      "--yes",
      "eoas@3.2.6",
      "publish",
      "--branch",
      "uat",
      "--platform",
      "android",
      "--nonInteractive",
      "--disableRepositoryCheck",
    ],
    env: {
      ...currentEnv,
      APP_VARIANT: "reader",
      OTA_CHANNEL: "UAT",
      EXPO_PUBLIC_API_BASE_URL: "https://libraryapi.ditest.in/api",
      EXPO_NO_DOTENV: "1",
      RELEASE_CHANNEL: "uat",
      DEBUG: "false",
    },
  };
}
