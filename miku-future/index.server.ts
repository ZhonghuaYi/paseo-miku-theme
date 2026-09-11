import type { PluginServerContext } from "@getpaseo/plugin/server";
import { mikuPreferences } from "./shared/preferences";

/**
 * Daemon-side entry: registers the host-scoped settings document so the
 * settings screen and the preference RPCs get built-in persistence.
 */
export default function contribute(server: PluginServerContext) {
  server.registerSettings(mikuPreferences);
  return () => {};
}
