import { describe, it, expect, vi, afterAll } from "vitest";
import { getUserRole } from "~/server/data/user";
import { api } from "~/trpc/react";

describe("#Get User Role", () => {
  const consoleMock = vi.spyOn(console, "log");

  afterAll(() => {
    consoleMock.mockReset();
  });

  it("#should return an ADMIN role", async () => {
    const result = await getUserRole("f42c5e46-f218-488f-878a-03f6d2527c25");
    console.log(result);
    expect(result).toBe("ADMIN");
  });
});

describe("#Get inventory data", () => {
  it("should return a batch object", () => {
    const result = api.inventory.listInventory;
    console.log(result);
    // expect(result).has("BatchVariants");
  });
});
