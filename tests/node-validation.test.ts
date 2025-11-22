import { describe, it, expect } from "vitest";
import { validateNodeConfig } from "~/utils/node-validation";

describe("validateNodeConfig", () => {
  describe("EMAIL node", () => {
    it("should require 'to' and 'subject' fields", () => {
      const result = validateNodeConfig("EMAIL", {}, "Test Email");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("requires \"to\" and \"subject\"");
    });

    it("should require 'subject' field when only 'to' is provided", () => {
      const result = validateNodeConfig("EMAIL", { to: "user@example.com" }, "Test Email");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("requires \"to\" and \"subject\"");
    });

    it("should validate email format", () => {
      const result = validateNodeConfig("EMAIL", { to: "invalid-email", subject: "Test" }, "Test Email");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("must have a valid \"to\" email address");
    });

    it("should reject email without @", () => {
      const result = validateNodeConfig("EMAIL", { to: "invalid.email.com", subject: "Test" }, "Test Email");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("must have a valid \"to\" email address");
    });

    it("should reject email without domain", () => {
      const result = validateNodeConfig("EMAIL", { to: "user@", subject: "Test" }, "Test Email");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("must have a valid \"to\" email address");
    });

    it("should accept valid email configuration", () => {
      const result = validateNodeConfig("EMAIL", { to: "user@example.com", subject: "Welcome" }, "Test Email");
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should trim whitespace from email before validation", () => {
      const result = validateNodeConfig("EMAIL", { to: "  user@example.com  ", subject: "Test" }, "Test Email");
      expect(result.valid).toBe(true);
    });
  });

  describe("SLACK node", () => {
    it("should require 'channel' field", () => {
      const result = validateNodeConfig("SLACK", {}, "Test Slack");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("requires a \"channel\"");
    });

    it("should accept valid channel configuration", () => {
      const result = validateNodeConfig("SLACK", { channel: "#general" }, "Test Slack");
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe("HTTP node", () => {
    it("should require 'url' field", () => {
      const result = validateNodeConfig("HTTP", {}, "Test HTTP");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("requires a \"url\"");
    });

    it("should validate URL format", () => {
      const result = validateNodeConfig("HTTP", { url: "not-a-url" }, "Test HTTP");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("invalid URL format");
    });

    it("should only accept http or https protocols", () => {
      const result = validateNodeConfig("HTTP", { url: "ftp://example.com" }, "Test HTTP");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("must use http or https URL");
    });

    it("should accept http URL", () => {
      const result = validateNodeConfig("HTTP", { url: "http://example.com" }, "Test HTTP");
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should accept https URL", () => {
      const result = validateNodeConfig("HTTP", { url: "https://example.com" }, "Test HTTP");
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should accept URL with path and query parameters", () => {
      const result = validateNodeConfig("HTTP", { url: "https://api.example.com/v1/users?id=123" }, "Test HTTP");
      expect(result.valid).toBe(true);
    });
  });

  describe("DELAY node", () => {
    it("should require 'durationMs' field", () => {
      const result = validateNodeConfig("DELAY", {}, "Test Delay");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("requires \"durationMs\"");
    });

    it("should accept valid duration configuration", () => {
      const result = validateNodeConfig("DELAY", { durationMs: 1000 }, "Test Delay");
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe("CONDITIONAL node", () => {
    it("should require 'expression' field", () => {
      const result = validateNodeConfig("CONDITIONAL", {}, "Test Conditional");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("requires an \"expression\"");
    });

    it("should accept valid expression configuration", () => {
      const result = validateNodeConfig("CONDITIONAL", { expression: "score > 50" }, "Test Conditional");
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe("Nodes that don't require validation", () => {
    it("should accept START node without config", () => {
      const result = validateNodeConfig("START", undefined, "Start");
      expect(result.valid).toBe(true);
    });

    it("should accept END node without config", () => {
      const result = validateNodeConfig("END", undefined, "End");
      expect(result.valid).toBe(true);
    });

    it("should accept TRANSFORM node without config", () => {
      const result = validateNodeConfig("TRANSFORM", undefined, "Transform");
      expect(result.valid).toBe(true);
    });

    it("should accept WEBHOOK node without config", () => {
      const result = validateNodeConfig("WEBHOOK", undefined, "Webhook");
      expect(result.valid).toBe(true);
    });
  });

  describe("Error messages", () => {
    it("should include node label in error messages", () => {
      const result = validateNodeConfig("EMAIL", {}, "Welcome Email Node");
      expect(result.error).toContain("Welcome Email Node");
    });

    it("should use node ID when label is not provided", () => {
      const result = validateNodeConfig("SLACK", {}, "node-123");
      expect(result.error).toContain("node-123");
    });
  });
});
