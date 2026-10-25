import { spawnSync } from "node:child_process";
import { createXpRemPublishInvocation } from "./ota-publish-config.mjs";

if (!process.env.EOO_TOKEN) {
  console.error("EOO_TOKEN is missing. Set it in the ignored .env file before publishing.");
  process.exit(1);
}

const invocation = createXpRemPublishInvocation();
const result = spawnSync(invocation.command, invocation.args, {
  stdio: "inherit",
  env: invocation.env,
});

if (result.error) {
  console.error(`Could not start the XPRem publisher: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status ?? 1);
