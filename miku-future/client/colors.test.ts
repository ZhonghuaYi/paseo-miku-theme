import { describe, expect, it } from "vitest";
import {
  DARK_MARKERS,
  hexToRgb,
  LIGHT_MARKERS,
  matchesMarker,
  MIKU_DARK_COLORS,
  MIKU_LIGHT_COLORS,
  parseRgba,
  rgbaString,
  scaledAlpha,
} from "./colors";

describe("hexToRgb", () => {
  it("parses six-digit hex with and without a leading hash", () => {
    expect(hexToRgb("#F7FCFB")).toEqual([247, 252, 251]);
    expect(hexToRgb("10181b")).toEqual([16, 24, 27]);
  });

  it("rejects malformed input", () => {
    expect(() => hexToRgb("#12345")).toThrow(/Invalid hex color/);
    expect(() => hexToRgb("magenta")).toThrow(/Invalid hex color/);
  });
});

describe("rgbaString", () => {
  it("formats and rounds alpha to two decimals", () => {
    expect(rgbaString([1, 2, 3], 0.5)).toBe("rgba(1, 2, 3, 0.5)");
    expect(rgbaString([1, 2, 3], 0.5616)).toBe("rgba(1, 2, 3, 0.56)");
  });

  it("clamps alpha into the valid range", () => {
    expect(rgbaString([1, 2, 3], 2)).toBe("rgba(1, 2, 3, 1)");
    expect(rgbaString([1, 2, 3], 0)).toBe("rgba(1, 2, 3, 0.05)");
  });
});

describe("scaledAlpha", () => {
  it("keeps the balanced preset unchanged", () => {
    expect(scaledAlpha(0.72, "balanced")).toBe(0.72);
  });

  it("hides more of the wallpaper on subtle and shows more on vivid", () => {
    expect(scaledAlpha(0.72, "subtle")).toBe(0.9);
    expect(scaledAlpha(0.72, "vivid")).toBe(0.56);
  });
});

describe("parseRgba", () => {
  it("parses rgb(), rgba() with comma alpha, and rgba() with slash alpha", () => {
    expect(parseRgba("rgb(1, 2, 3)")).toEqual([1, 2, 3, 1]);
    expect(parseRgba("rgba(1, 2, 3, 0.5)")).toEqual([1, 2, 3, 0.5]);
    expect(parseRgba("rgba(1 2 3 / 0.5)")).toEqual([1, 2, 3, 0.5]);
  });

  it("rejects non-color strings", () => {
    expect(parseRgba("red")).toBeNull();
    expect(parseRgba("rgba(1, 2)")).toBeNull();
    expect(parseRgba("")).toBeNull();
  });
});

describe("matchesMarker", () => {
  it("matches the exact marker and colors within the ±2 tolerance", () => {
    expect(matchesMarker([247, 252, 251, 1], LIGHT_MARKERS)).toBe(true);
    expect(matchesMarker([249, 252, 251, 1], LIGHT_MARKERS)).toBe(true);
  });

  it("rejects distant colors and nearly transparent ones", () => {
    expect(matchesMarker([255, 252, 251, 1], LIGHT_MARKERS)).toBe(false);
    expect(matchesMarker([247, 252, 251, 0.05], LIGHT_MARKERS)).toBe(false);
  });
});

describe("theme markers", () => {
  it("derives light markers from the light background and control colors", () => {
    expect(LIGHT_MARKERS).toEqual([
      hexToRgb(MIKU_LIGHT_COLORS.background),
      hexToRgb(MIKU_LIGHT_COLORS.control),
    ]);
  });

  it("derives dark markers from the dark background, raised, and control colors", () => {
    expect(DARK_MARKERS).toEqual([
      hexToRgb(MIKU_DARK_COLORS.background),
      hexToRgb(MIKU_DARK_COLORS.raised),
      hexToRgb(MIKU_DARK_COLORS.control),
    ]);
  });
});
