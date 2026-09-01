import type { PluginContext, PluginThemeContribution } from "@getpaseo/plugin";
import { installMikuBackground } from "./background.client";

const LIGHT_THEME = {
  id: "future-light",
  name: "Miku Future Light",
  appearance: "light",
  colors: {
    // Keep authored Paseo surfaces opaque. The client enhancement reveals the
    // wallpaper only on chat, Markdown, source-code, and diff content surfaces.
    background: "#F7FCFB",
    foreground: "#203638",
    raised: "#FFFFFF",
    control: "#E6F5F3",
    border: "#B9DCD8",
    // Deeper than the iconic turquoise so light button labels meet WCAG AA.
    accent: "#087F79",
    mutedForeground: "#5A7375",
    ring: "#2B8F8A",
  },
} satisfies PluginThemeContribution;

const DARK_THEME = {
  id: "future-dark",
  name: "Miku Future Dark",
  appearance: "dark",
  colors: {
    background: "#10181B",
    foreground: "#EAF7F6",
    raised: "#172326",
    control: "#203236",
    border: "#38555A",
    // The canonical brighter Miku turquoise has strong contrast on the dark canvas.
    accent: "#39C5BB",
    mutedForeground: "#9AB6B8",
    ring: "#65DED2",
  },
} satisfies PluginThemeContribution;

/**
 * Register both official Paseo color themes. The light registration also
 * installs a progressive Web/Electron wallpaper enhancement. Paseo's compiler
 * strips both addTheme calls and the *.client import from the daemon bundle.
 */
export default function contribute(plugin: PluginContext) {
  plugin.addTheme(installMikuBackground(LIGHT_THEME));
  plugin.addTheme(DARK_THEME);

  return () => {
    // The same contribution function also runs in the daemon, where document is
    // absent. Client cleanup is deliberately self-contained so stable Paseo
    // versions do not need the newer addClientSide API.
    if (typeof document === "undefined") return;
    const layer = document.getElementById("paseo-miku-wallpaper");
    const cleanup = layer ? Reflect.get(layer, "__paseoMikuCleanup") : null;
    if (typeof cleanup === "function") cleanup();
  };
}
