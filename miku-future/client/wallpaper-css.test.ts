import { describe, expect, it } from "vitest";
import { buildWallpaperCss } from "./wallpaper-css";

const BALANCED_MAGENTA_STRONG = {
  scrim: "balanced",
  accent: "magenta",
  blur: "strong",
} as const;

describe("buildWallpaperCss", () => {
  it("marks every runtime-decorated surface", () => {
    const css = buildWallpaperCss(BALANCED_MAGENTA_STRONG);
    expect(css).toContain('[data-paseo-miku-chat-surface]');
    expect(css).toContain('[data-paseo-miku-chat-clear]');
    expect(css).toContain('[data-paseo-miku-workspace-sidebar]');
    expect(css).toContain('[data-paseo-miku-right-sidebar]');
    expect(css).toContain('[data-paseo-miku-workspace-tabs]');
    expect(css).toContain('data-paseo-miku-wallpaper="light"');
    expect(css).toContain('data-paseo-miku-wallpaper="dark"');
  });

  it("keeps the compact-layout fallback and the desktop breakpoint", () => {
    const css = buildWallpaperCss(BALANCED_MAGENTA_STRONG);
    expect(css).toContain("@media (min-width: 721px)");
    expect(css).toContain("@media (max-width: 720px)");
  });

  it("styles the fixed test-id surfaces and modern selectors", () => {
    const css = buildWallpaperCss(BALANCED_MAGENTA_STRONG);
    expect(css).toContain('[data-testid="user-message"]');
    expect(css).toContain('[data-testid="terminal-surface"]::after');
    expect(css).toContain('[data-testid="git-diff-canvas-root"]::after');
    expect(css).toContain(":has(");
  });

  it("uses the balanced scrim alphas by default", () => {
    const css = buildWallpaperCss(BALANCED_MAGENTA_STRONG);
    expect(css).toContain("rgba(247, 252, 251, 0.72)");
    expect(css).toContain("rgba(16, 24, 27, 0.74)");
  });

  it("scales scrims with the visibility preset", () => {
    const vivid = buildWallpaperCss({
      ...BALANCED_MAGENTA_STRONG,
      scrim: "vivid",
    });
    expect(vivid).toContain("rgba(247, 252, 251, 0.56)");
    const subtle = buildWallpaperCss({
      ...BALANCED_MAGENTA_STRONG,
      scrim: "subtle",
    });
    expect(subtle).toContain("rgba(247, 252, 251, 0.9)");
  });

  it("uses the magenta accent borders by default", () => {
    const css = buildWallpaperCss(BALANCED_MAGENTA_STRONG);
    expect(css).toContain("rgba(225, 40, 133, 0.86)");
    expect(css).toContain("rgba(255, 126, 190, 0.94)");
    expect(css).toContain("rgba(29, 23, 48, 0.5)");
  });

  it("switches message accents to turquoise", () => {
    const css = buildWallpaperCss({
      ...BALANCED_MAGENTA_STRONG,
      accent: "turquoise",
    });
    expect(css).toContain("rgba(8, 127, 121, 0.86)");
    expect(css).toContain("rgba(101, 222, 210, 0.94)");
    expect(css).toContain("rgba(13, 29, 28, 0.5)");
    expect(css).not.toContain("rgba(225, 40, 133, 0.86)");
  });

  it("applies strong blur tiers by default", () => {
    const css = buildWallpaperCss(BALANCED_MAGENTA_STRONG);
    expect(css).toContain("blur(22px)");
    expect(css).toContain("blur(18px)");
    expect(css).toContain("blur(16px)");
  });

  it("applies medium blur tiers", () => {
    const css = buildWallpaperCss({
      ...BALANCED_MAGENTA_STRONG,
      blur: "medium",
    });
    expect(css).toContain("blur(14px)");
    expect(css).not.toContain("blur(22px)");
  });

  it("omits every backdrop-filter layer when blur is off", () => {
    const css = buildWallpaperCss({
      ...BALANCED_MAGENTA_STRONG,
      blur: "off",
    });
    // Assert on the property, not the bare word: a code comment mentions
    // backdrop-filter by name.
    expect(css).not.toContain("backdrop-filter:");
    expect(css).not.toContain("-webkit-backdrop-filter:");
  });
});
