import { spawnSync } from "node:child_process";

if (!process.env.EOO_TOKEN) {
  console.error("EOO_TOKEN is missing. Set it in the ignored .env file before rolling back.");
  process.exit(1);
}

const result = spawnSync(
  "npx",
  [
    "--yes",
    "eoas@3.2.6",
    "rollback",
    "--branch",
    "uat",
    "--platform",
    "android",
    "--non-interactive",
  ],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      APP_VARIANT: "reader",
      OTA_CHANNEL: "UAT",
      RELEASE_CHANNEL: "uat",
    },
  },
);

if (result.error) {
  console.error(`Could not start the XPRem rollback: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status ?? 1);
