import { describe, expect, it } from "vitest";

import { assertOwnedByUser, OwnershipError } from "./ownership";

describe("ownership boundary", () => {
  it("accepts the authenticated owner's record", () => {
    expect(() => assertOwnedByUser("user-a", "user-a")).not.toThrow();
  });

  it("rejects another user's record", () => {
    expect(() => assertOwnedByUser("user-a", "user-b")).toThrow(OwnershipError);
  });
});
