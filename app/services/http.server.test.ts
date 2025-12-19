import { describe, expect, it } from "vitest";

import { combineHeaders } from "~/services/http.server";

describe("http.server", () => {
  describe("combineHeaders", () => {
    it("should combine multiple headers", () => {
      const headers1 = { "Content-Type": "application/json" };
      const headers2 = { "X-Custom-Header": "value" };

      const combined = combineHeaders(headers1, headers2);

      expect(combined.get("Content-Type")).toBe("application/json");
      expect(combined.get("X-Custom-Header")).toBe("value");
    });

    it("should handle null and undefined headers", () => {
      const headers = { "Content-Type": "application/json" };

      const combined = combineHeaders(null, headers, undefined);

      expect(combined.get("Content-Type")).toBe("application/json");
    });

    it("should append duplicate headers", () => {
      const headers1 = { "Set-Cookie": "cookie1=value1" };
      const headers2 = { "Set-Cookie": "cookie2=value2" };

      const combined = combineHeaders(headers1, headers2);

      expect(combined.get("Set-Cookie")).toBe("cookie1=value1, cookie2=value2");
    });

    it("should return empty headers when no headers provided", () => {
      const combined = combineHeaders();

      expect(Array.from(combined.keys()).length).toBe(0);
    });

    it("should work with Headers objects", () => {
      const headers1 = new Headers({ "Content-Type": "application/json" });
      const headers2 = new Headers({ "X-Custom-Header": "value" });

      const combined = combineHeaders(headers1, headers2);

      expect(combined.get("Content-Type")).toBe("application/json");
      expect(combined.get("X-Custom-Header")).toBe("value");
    });
  });
});
