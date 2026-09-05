import { describe, expect, it, vi } from "vitest";

import { deleteCurrentAccount } from "./account-deletion";

describe("account deletion boundary", () => {
  it("refuses to delete without an authenticated user", async () => {
    const deleteUser = vi.fn();
    const signOut = vi.fn();

    await expect(
      deleteCurrentAccount({
        getCurrentUser: async () => null,
        deleteUser,
        signOut,
      }),
    ).resolves.toBe(false);

    expect(deleteUser).not.toHaveBeenCalled();
    expect(signOut).not.toHaveBeenCalled();
  });

  it("deletes and signs out exactly the current user", async () => {
    const deleteUser = vi.fn(async () => undefined);
    const signOut = vi.fn(async () => undefined);

    await expect(
      deleteCurrentAccount({
        getCurrentUser: async () => ({ id: "user-a" }),
        deleteUser,
        signOut,
      }),
    ).resolves.toBe(true);

    expect(deleteUser).toHaveBeenCalledOnce();
    expect(deleteUser).toHaveBeenCalledWith("user-a");
    expect(signOut).toHaveBeenCalledOnce();
  });
});
