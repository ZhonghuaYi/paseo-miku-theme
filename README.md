<div align="center">

# Paseo Miku Theme

A polished Hatsune Miku-inspired light and dark theme pack for
[Paseo](https://github.com/getpaseo/paseo), with lossless illustrated wallpapers
and carefully scoped frosted-glass surfaces.

**English** · [简体中文](./README.zh-CN.md)

</div>

> [!NOTE]
> This is an unofficial fan-made theme and is not affiliated with or endorsed by
> Crypton Future Media, Inc. Hatsune Miku and related marks belong to their
> respective owners.

## In-app screenshots

Captured in Paseo Desktop with the continuous chat wallpaper and frosted composer
enabled:

| Miku Future Light in Paseo | Miku Future Dark in Paseo |
| --- | --- |
| ![Miku Future Light theme in Paseo](./screenshot-light.png) | ![Miku Future Dark theme in Paseo](./screenshot-dark.png) |

## Original wallpapers

| Miku Future Light | Miku Future Dark |
| --- | --- |
| ![Miku Future Light wallpaper](./miku-future/assets/miku-future-light-background.png) | ![Miku Future Dark wallpaper](./miku-future/assets/miku-future-dark-background.png) |

## Features

> Palette note: official character material describes Miku's signature hair as
> blue-green; there is no single official "Miku purple." This theme uses the
> commonly sampled Miku-magenta accent `#E12885` for user-message borders.

- Two complete Paseo color themes: **Miku Future Light** and **Miku Future Dark**.
- A **Miku** menu button on every workspace header toggles the wallpaper and
  opens the plugin's settings.
- Configurable from **Settings → Plugins → Miku Future**: wallpaper on/off,
  visibility (subtle / balanced / vivid), message accent (Miku magenta or
  turquoise), and glass blur strength. Choices persist on the host across
  restarts and plugin reloads.
- Original lossless PNG artwork is embedded in the plugin. At runtime it is exposed
  through short Blob URLs, preserving every source byte without hitting Chromium's
  data-URL length limit.
- The conversation history and composer share one continuous wallpaper.
- Your message bubbles and the composer card use a restrained translucent glass
  treatment with an `18px` backdrop blur. User bubbles carry a clearer Miku-magenta
  border (`#E12885`) so they remain easy to scan; AI responses remain visually lightweight.
- Fenced code blocks in chat use a separate translucent glass sheet with syntax
  colors preserved and a soft readable edge.
- Markdown preview and source-code views inherit the wallpaper with a uniform
  readability scrim.
- The desktop workspace sidebar, workspace tab bar, and right explorer sidebar
  use an image-backed translucent glass treatment with a `22px` backdrop blur.
- Git diffs receive a subtle, non-interactive wallpaper texture that keeps code text
  clear.
- No left-to-right gradient mask: the same scrim is applied across the full image.
- Menus, settings, terminals, and unrelated work surfaces retain Paseo's original
  materials.
- Wallpaper enhancement automatically disables below `721px` and whenever a non-Miku
  theme is selected.

## Readability

The base theme colors meet WCAG AA contrast requirements for normal text:

| Theme | Body / background | Muted text / background | Button text / accent |
| --- | ---: | ---: | ---: |
| Light | `12.31:1` | `4.89:1` | `4.69:1` |
| Dark | `16.37:1` | `8.35:1` | `8.45:1` |

Wallpaper surfaces add a uniform light or dark scrim on top of those base colors.

## Platform support

Paseo's official `addTheme` API accepts colors but not background images. This plugin
therefore treats the artwork as a progressive enhancement:

| Platform | Theme colors | Illustrated wallpaper |
| --- | :---: | :---: |
| Paseo Desktop / Electron | Yes | Yes |
| Paseo Web | Yes | Yes |
| iOS / Android | Yes | No |

If Paseo's DOM changes in a future release, the official color themes continue to
work even when the wallpaper enhancement cannot be applied.

## Installation

Paseo `v0.8.0` or newer is required; the plugin uses the v0.8 runtime-entry format
and will not load on older versions. In Paseo, open **Settings → Plugins** and enable
**Enable plugins** first.

Then clone this repository and install its plugin directory:

```bash
git clone https://github.com/ZhonghuaYi/paseo-miku-theme.git
cd paseo-miku-theme
paseo plugin install "$(pwd)/miku-future"
paseo plugin ls
```

Open **Settings → Appearance → Theme**, then select **Miku Future Light** or
**Miku Future Dark**.

## Updating

```bash
git pull
paseo plugin reload miku-future
```

For a remote daemon, append `--host <url>` to the Paseo command.

## Development

The distributable plugin lives in [`miku-future/`](./miku-future):

- `index.client.ts` is the client entry: themes, the settings screen, and a
  per-workspace wallpaper header button;
- `index.server.ts` is the daemon entry: it registers the persisted settings
  document;
- `shared/preferences.ts` defines that document (wallpaper, visibility,
  accent, blur) plus the RPC contracts used outside React;
- `client/colors.ts` is the single source of truth for the palette — themes,
  detection markers, scrims, and accents all derive from it;
- `client/wallpaper-css.ts` builds the enhancement stylesheet from those
  colors and the user's style options;
- `client/background.ts` applies, updates, and cleans up the Web/Electron
  wallpaper enhancement;
- `client/settings-screen.tsx` is the Settings → Plugins screen;
- `client/background-data.ts` is generated from the PNG files in `assets/`;
- `client/dom.d.ts` declares the minimal DOM surface the enhancement
  typechecks against;
- `assets/` contains only the two lossless PNG files used at runtime.

After editing source files, install the dev toolchain, typecheck, and test
before reloading:

```bash
cd miku-future
npm install
npm run typecheck
npm test
```

After replacing either PNG, regenerate the embedded client data and reload the plugin:

```bash
node miku-future/scripts/embed-backgrounds.mjs
paseo plugin reload miku-future
```

## Uninstalling

```bash
paseo plugin remove miku-future
```

## README languages

GitHub does not currently switch repository READMEs according to a visitor's interface
language. Use the language links at the top of this page to switch between the complete
English and Simplified Chinese versions.
