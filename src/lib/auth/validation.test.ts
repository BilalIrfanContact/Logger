import { describe, expect, it } from "vitest";

import { publicAuthError, safeNextPath, validateEmail, validatePassword } from "./validation";

describe("auth boundary validation", () => {
  it("normalizes valid emails and keeps invalid input out of the provider", () => {
    expect(validateEmail("  PERSON@Example.com ")).toEqual({ valid: true, value: "person@example.com" });
    expect(validateEmail("not-an-email")).toEqual({ valid: false, error: "Enter a valid email address." });
  });

  it("requires a minimum password length", () => {
    expect(validatePassword("short")).toEqual({ valid: false, error: "Password must be at least 8 characters." });
    expect(validatePassword("long-enough")).toEqual({ valid: true, value: "long-enough" });
  });

  it("allows only local post-auth paths", () => {
    expect(safeNextPath("/app/account")).toBe("/app/account");
    expect(safeNextPath("https://evil.example")).toBe("/app");
    expect(safeNextPath("//evil.example")).toBe("/app");
  });

  it("does not expose provider error details to the user", () => {
    expect(publicAuthError("Invalid login credentials")).toBe("The email or password is incorrect.");
    expect(publicAuthError("secret database response")).toBe("Something went wrong. Please try again.");
  });
});
