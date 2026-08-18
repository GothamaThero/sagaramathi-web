import { describe, it } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const TEST_JWT_SECRET = "test_secret_key_123456789";

describe("QA Backend Authentication Suite", () => {
  it("should hash and verify passwords correctly with bcrypt", async () => {
    const rawPassword = "SecurePassword123!";
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    assert.notEqual(hashedPassword, rawPassword);
    const isMatch = await bcrypt.compare(rawPassword, hashedPassword);
    assert.equal(isMatch, true);

    const isWrongMatch = await bcrypt.compare("WrongPassword", hashedPassword);
    assert.equal(isWrongMatch, false);
  });

  it("should sign and verify JWT tokens correctly", () => {
    const payload = { userId: 42, role: "ADMIN", email: "admin@sagaramati.lk" };
    const token = jwt.sign(payload, TEST_JWT_SECRET, { expiresIn: "1h" });

    assert.ok(token);
    assert.equal(typeof token, "string");

    const decoded = jwt.verify(token, TEST_JWT_SECRET) as any;
    assert.equal(decoded.userId, 42);
    assert.equal(decoded.role, "ADMIN");
    assert.equal(decoded.email, "admin@sagaramati.lk");
  });

  it("should reject tampered or invalid JWT tokens", () => {
    const payload = { userId: 10, role: "USER" };
    const token = jwt.sign(payload, TEST_JWT_SECRET, { expiresIn: "1h" });
    const tamperedToken = token + "invalid";

    assert.throws(() => {
      jwt.verify(tamperedToken, TEST_JWT_SECRET);
    });
  });
});
