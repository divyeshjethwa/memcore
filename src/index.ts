import { fileURLToPath } from "node:url";

import { startMcpServer } from "./mcpServer.js";

export { createMcpServer, startMcpServer } from "./mcpServer.js";

export function getServerName(): string {
  return "memcore";
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await startMcpServer();
}
