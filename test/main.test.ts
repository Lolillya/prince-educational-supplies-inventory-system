import { describe, it, expect, vi } from "vitest";
// import { getUserRole } from "./path-to-your-function-file"; // Adjust the import path
import { getUserRole } from "~/server/data/user";

describe("Get User Role", () => {
  it("should return an ADMIN role", () => {
    const result = getUserRole("");

    expect(result).toBe("ADMIN");
  });
});
