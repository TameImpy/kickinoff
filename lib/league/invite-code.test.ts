import { describe, it, expect } from "vitest";
import { generateInviteCode } from "./invite-code";

describe("generateInviteCode", () => {
  it("generates a 6-character uppercase alphanumeric code", () => {
    const code = generateInviteCode();
    expect(code).toMatch(/^[A-Z0-9]{6}$/);
  });

  it("generates unique codes across multiple calls", () => {
    const codes = new Set(Array.from({ length: 100 }, () => generateInviteCode()));
    expect(codes.size).toBe(100);
  });
});
