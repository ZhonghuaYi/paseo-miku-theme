import { defineSettings, settingsRpc } from "@getpaseo/plugin";
import { z } from "zod";

/**
 * Host-scoped persisted preferences for the Miku theme. The wallpaper
 * controller applies them imperatively; the settings screen edits them
 * through `useSettings`; header buttons read and write them through
 * `mikuPreferencesRpc` outside React.
 *
 * The literal unions here are the authority; client/colors.ts derives its
 * display labels and visual mappings from them via type-only imports.
 */
export const mikuPreferencesSchema = z.object({
  wallpaperEnabled: z.boolean().default(true),
  // Keep these literals in sync with the mappings in client/colors.ts.
  scrim: z.enum(["subtle", "balanced", "vivid"]).default("balanced"),
  accent: z.enum(["magenta", "turquoise"]).default("magenta"),
  blur: z.enum(["off", "medium", "strong"]).default("strong"),
});

export const mikuPreferences = defineSettings({
  id: "miku-preferences",
  scope: "host",
  version: 1,
  schema: mikuPreferencesSchema,
});

export type MikuPreferences = z.infer<typeof mikuPreferencesSchema>;

export const MIKU_PREFERENCES_DEFAULTS: MikuPreferences =
  mikuPreferencesSchema.parse({});

/** The settings doc id, for RPC contracts used outside React contexts. */
export const MIKU_SETTINGS_ID = "miku-preferences";

/** Read/write contracts callable via `client.rpc(...)` from entries and buttons. */
export const mikuPreferencesRpc = settingsRpc(MIKU_SETTINGS_ID);

/** Parse untrusted stored values; falls back to defaults when invalid. */
export function parseMikuPreferences(values: unknown): MikuPreferences {
  const result = mikuPreferencesSchema.safeParse(values);
  return result.success ? result.data : MIKU_PREFERENCES_DEFAULTS;
}
