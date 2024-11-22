import { describe, it, expect, vi, afterAll } from "vitest";
import { getUserRole } from "~/server/data/user";

describe("#Get User Role", () => {
  const consoleMock = vi.spyOn(console, "log");

  afterAll(() => {
    consoleMock.mockReset();
  });

  it("#should return an ADMIN role", async () => {
    const result = getUserRole("f3ff267e-96eb-42d6-8001-e2158acc7d51");
    console.log(result);
    expect(result).toBe("ADMIN");
  });
});
