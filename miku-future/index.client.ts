import type {
  PluginButton,
  PluginButtonRegistration,
  PluginClientContext,
} from "@getpaseo/plugin/client";
import type { PluginThemeContribution } from "@getpaseo/plugin";
import {
  applyMikuPreferences,
  getMikuPreferences,
  installMikuBackground,
  onMikuPreferencesChanged,
  removeMikuBackground,
} from "./client/background";
import { MIKU_DARK_COLORS, MIKU_LIGHT_COLORS } from "./client/colors";
import { MikuSettingsScreen } from "./client/settings-screen";
import {
  mikuPreferencesRpc,
  parseMikuPreferences,
  type MikuPreferences,
} from "./shared/preferences";

const MIKU_SETTINGS_SCREEN_ID = "miku-settings";

const LIGHT_THEME = {
  id: "future-light",
  name: "Miku Future Light",
  appearance: "light",
  // Keep authored Paseo surfaces opaque. The client enhancement reveals the
  // wallpaper only on chat, Markdown, source-code, and diff content surfaces.
  colors: MIKU_LIGHT_COLORS,
} satisfies PluginThemeContribution;

const DARK_THEME = {
  id: "future-dark",
  name: "Miku Future Dark",
  appearance: "dark",
  colors: MIKU_DARK_COLORS,
} satisfies PluginThemeContribution;

/**
 * Register both official Paseo color themes, the settings screen, and a
 * per-workspace header button for the wallpaper enhancement; on native hosts
 * the wallpaper installer no-ops and only the plain themes ship.
 */
export default function contribute(client: PluginClientContext) {
  client.addTheme(installMikuBackground(LIGHT_THEME));
  client.addTheme(DARK_THEME);

  client.addSettingsScreen({
    id: MIKU_SETTINGS_SCREEN_ID,
    title: "Miku Future",
    icon: "Palette",
    Component: MikuSettingsScreen,
  });

  const headerButtons = new Map<string, PluginButtonRegistration>();
  let disposed = false;

  const mikuButton = (): PluginButton => {
    const enabled = getMikuPreferences().wallpaperEnabled;
    return {
      title: "Miku Future",
      icon: "Wallpaper",
      label: "Miku",
      behavior: {
        kind: "menu",
        items: [
          {
            kind: "item",
            id: "toggle-wallpaper",
            title: enabled ? "Turn wallpaper off" : "Turn wallpaper on",
            icon: enabled ? "EyeOff" : "Eye",
            behavior: { kind: "action", onPress: () => void toggleWallpaper() },
          },
          { kind: "separator", id: "actions-separator" },
          {
            kind: "item",
            id: "open-settings",
            title: "Miku settings…",
            icon: "SlidersHorizontal",
            behavior: {
              kind: "action",
              onPress: () => client.openSettings(MIKU_SETTINGS_SCREEN_ID),
            },
          },
        ],
      },
    };
  };

  /** Read-modify-write through the settings RPC, retrying once on conflict. */
  const writePreferencePatch = async (
    patch: Partial<MikuPreferences>,
  ): Promise<void> => {
    // Instant local effect; persistence follows.
    applyMikuPreferences({ ...getMikuPreferences(), ...patch });
    try {
      for (let attempt = 0; attempt < 2; attempt += 1) {
        const read = await client.rpc(mikuPreferencesRpc.read, {});
        if (read.status !== "ready") return;
        const merged = { ...parseMikuPreferences(read.values), ...patch };
        const written = await client.rpc(mikuPreferencesRpc.write, {
          revision: read.revision,
          values: merged,
        });
        if (written.status === "saved") {
          applyMikuPreferences(parseMikuPreferences(written.values));
          return;
        }
        if (written.status !== "conflict") return;
      }
    } catch {
      // Persistence unavailable; the locally applied change stands until
      // the plugin reloads.
    }
  };

  const toggleWallpaper = (): Promise<void> =>
    writePreferencePatch({
      wallpaperEnabled: !getMikuPreferences().wallpaperEnabled,
    });

  const ensureHeaderButton = (workspaceId: string): void => {
    if (disposed || headerButtons.has(workspaceId)) return;
    try {
      headerButtons.set(
        workspaceId,
        client.addHeaderButton({
          // One id across workspaces: registrations are keyed by plugin,
          // placement, id, and workspace. Must match /^[a-z][a-z0-9-]*$/.
          id: "miku-wallpaper",
          workspaceId,
          button: mikuButton(),
        }),
      );
    } catch (error) {
      // Surface registration problems in the app console instead of
      // silently dropping the button.
      console.error("[miku-future] header button registration failed", error);
    }
  };

  const unsubscribeWorkspaces = client.paseo.workspaces.subscribe((update) => {
    if (update.kind === "upsert") ensureHeaderButton(update.workspace.id);
  });
  void client.paseo
    .workspaces
    .list()
    .then((result) => {
      for (const workspace of result.entries) ensureHeaderButton(workspace.id);
    })
    .catch((error) => {
      // Listing failed; the subscription still covers workspaces created
      // later. Keep the failure visible for diagnosis.
      console.error("[miku-future] workspace listing failed", error);
    });

  // Header menus and the settings screen share the controller's state; keep
  // every button's menu in sync when preferences change from any writer.
  const unsubscribePreferences = onMikuPreferencesChanged(() => {
    for (const registration of headerButtons.values()) {
      registration.update(mikuButton());
    }
  });

  // Apply persisted preferences as soon as the host can serve them.
  void client
    .rpc(mikuPreferencesRpc.read, {})
    .then((read) => {
      if (read.status === "ready") {
        applyMikuPreferences(parseMikuPreferences(read.values));
      }
    })
    .catch(() => {
      // Host without settings persistence; defaults stand.
    });

  return () => {
    disposed = true;
    unsubscribeWorkspaces();
    unsubscribePreferences();
    for (const registration of headerButtons.values()) registration.remove();
    headerButtons.clear();
    removeMikuBackground();
  };
}
