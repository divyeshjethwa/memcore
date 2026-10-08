import { describe, expect, it } from "vitest";

import { createMcpServer } from "../src/mcpServer.js";

describe("createMcpServer", () => {
  it("creates an MCP server entrypoint without crashing", () => {
    const server = createMcpServer();

    expect(server).toBeDefined();
  });
});
