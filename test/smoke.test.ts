import { describe, expect, it } from "vitest";

import { getServerName } from "../src/index.js";

describe("memcore project setup", () => {
  it("exposes the server name", () => {
    expect(getServerName()).toBe("memcore");
  });
});
