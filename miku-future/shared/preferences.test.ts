import { describe, expect, it } from "vitest";
import {
  MIKU_PREFERENCES_DEFAULTS,
  mikuPreferencesRpc,
  parseMikuPreferences,
} from "./preferences";

describe("Miku preferences document", () => {
  it("fills every field with defaults from an empty document", () => {
    expect(MIKU_PREFERENCES_DEFAULTS).toEqual({
      wallpaperEnabled: true,
      scrim: "balanced",
      accent: "magenta",
      blur: "strong",
    });
  });

  it("parses partial documents and strips unknown keys", () => {
    const parsed = parseMikuPreferences({ scrim: "vivid", hack: true });
    expect(parsed).toEqual({ ...MIKU_PREFERENCES_DEFAULTS, scrim: "vivid" });
  });

  it("falls back to defaults when stored values are invalid", () => {
    expect(parseMikuPreferences({ scrim: "nope" })).toEqual(
      MIKU_PREFERENCES_DEFAULTS,
    );
    expect(parseMikuPreferences("not an object")).toEqual(
      MIKU_PREFERENCES_DEFAULTS,
    );
  });

  it("exposes read and write RPC contracts for non-React callers", () => {
    expect(mikuPreferencesRpc.read).toBeTruthy();
    expect(mikuPreferencesRpc.write).toBeTruthy();
  });
});
