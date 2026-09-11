// Miku settings screen under Settings → Plugins. Edits persist through the
// host-scoped settings document and are applied to the wallpaper controller
// immediately for live feedback.

import { useEffect, useMemo } from "react";
import { Text } from "react-native";
import {
  useSettings,
  type PluginSurfaceProps,
  type SettingsState,
} from "@getpaseo/plugin/client";
import {
  SettingsAction,
  SettingsCard,
  SettingsSection,
  SettingsSelect,
  SettingsSwitch,
} from "@getpaseo/plugin/client/ui";
import { applyMikuPreferences } from "./background";
import { ACCENT_CHOICES, BLUR_LEVELS, SCRIM_LEVELS } from "./colors";
import { mikuPreferences, type MikuPreferences } from "../shared/preferences";

type ReadySettings = Extract<
  SettingsState<typeof mikuPreferences.schema>,
  { status: "ready" }
>;

export function MikuSettingsScreen({ theme }: PluginSurfaceProps) {
  const settings = useSettings(mikuPreferences);
  const mutedStyle = useMemo(
    () => ({ color: theme.colors.foregroundMuted }),
    [theme],
  );
  const dangerStyle = useMemo(
    () => ({ color: theme.colors.statusDanger }),
    [theme],
  );

  const valuesKey =
    settings.status === "ready" ? JSON.stringify(settings.values) : "";

  // Apply persisted values as soon as they arrive; this also covers hosts
  // where the entry-time RPC read could not run.
  useEffect(() => {
    if (settings.status === "ready") applyMikuPreferences(settings.values);
  }, [valuesKey, settings.status]); // valuesKey captures the values

  if (settings.status === "loading") {
    return <Text style={mutedStyle}>Loading Miku settings…</Text>;
  }

  if (settings.status !== "ready") {
    return (
      <SettingsSection title="Miku Future">
        <Text style={dangerStyle}>{settings.error}</Text>
        <SettingsAction
          label="Could not read settings"
          actionLabel="Retry"
          onPress={() => void settings.reload()}
        />
        {settings.status === "invalid" ? (
          <SettingsAction
            label="Stored values are invalid"
            actionLabel="Restore defaults"
            onPress={() => void settings.reset()}
          />
        ) : null}
      </SettingsSection>
    );
  }

  const change = <Key extends keyof MikuPreferences>(
    key: Key,
    value: MikuPreferences[Key],
  ) => {
    const next: MikuPreferences = { ...settings.values, [key]: value };
    // Instant local feedback; persistence follows.
    applyMikuPreferences(next);
    void settings.save(next, settings.revision).then((saved) => {
      if (!saved) void settings.reload();
    });
  };

  const disabled = settings.saving;
  return (
    <SettingsSection title="Miku Future">
      <SettingsCard>
        <SettingsSwitch
          label="Wallpaper"
          hint="Paint the Miku illustration behind chat and glass surfaces"
          value={settings.values.wallpaperEnabled}
          disabled={disabled}
          onValueChange={(value) => change("wallpaperEnabled", value)}
        />
        <SettingsSelect
          label="Wallpaper visibility"
          value={settings.values.scrim}
          options={SCRIM_LEVELS}
          disabled={disabled}
          onValueChange={(value) => change("scrim", value)}
        />
        <SettingsSelect
          label="Message accent"
          value={settings.values.accent}
          options={ACCENT_CHOICES}
          disabled={disabled}
          onValueChange={(value) => change("accent", value)}
        />
        <SettingsSelect
          label="Glass blur"
          value={settings.values.blur}
          options={BLUR_LEVELS}
          disabled={disabled}
          onValueChange={(value) => change("blur", value)}
        />
      </SettingsCard>
      {settings.saveError ? (
        <Text accessibilityRole="alert" style={dangerStyle}>
          {settings.saveError}
        </Text>
      ) : null}
      <Text style={mutedStyle}>
        The wallpaper enhancement applies to the web and desktop apps; mobile
        keeps Paseo&apos;s native surfaces.
      </Text>
    </SettingsSection>
  );
}
