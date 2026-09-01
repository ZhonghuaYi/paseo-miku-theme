import type { PluginThemeContribution } from "@getpaseo/plugin";
import {
  DARK_BACKGROUND_DATA_URL,
  LIGHT_BACKGROUND_DATA_URL,
} from "./background-data.client";

const LAYER_ID = "paseo-miku-wallpaper";
const STYLE_ID = "paseo-miku-wallpaper-style";
const ROOT_ATTRIBUTE = "data-paseo-miku-wallpaper";
const CLEANUP_PROPERTY = "__paseoMikuCleanup";
const IMAGE_PROPERTY = "--paseo-miku-wallpaper-image";
const CHAT_SURFACE_ATTRIBUTE = "data-paseo-miku-chat-surface";
const CHAT_CLEAR_ATTRIBUTE = "data-paseo-miku-chat-clear";

type WallpaperMode = "light" | "dark";
type Rgba = readonly [red: number, green: number, blue: number, alpha: number];

interface WallpaperImageUrls {
  readonly light: string;
  readonly dark: string;
  revoke(): void;
}

// Unique colors from index.ts. Avoiding generic white/black markers prevents
// an unrelated Paseo theme from accidentally enabling the illustration.
const LIGHT_MARKERS = [
  [247, 252, 251],
  [230, 245, 243],
] as const;
const DARK_MARKERS = [
  [16, 24, 27],
  [23, 35, 38],
  [32, 50, 54],
] as const;

const WALLPAPER_CSS = `
/* This hidden node owns cleanup state; the selected content surfaces paint the image. */
#${LAYER_ID} {
  display: none !important;
}

/* The two identical color stops create one uniform scrim, not a directional mask. */
html[${ROOT_ATTRIBUTE}="light"] [${CHAT_SURFACE_ATTRIBUTE}] {
  background-image:
    linear-gradient(rgba(247, 252, 251, 0.72), rgba(247, 252, 251, 0.72)),
    var(${IMAGE_PROPERTY}) !important;
  background-position: center right !important;
  background-repeat: no-repeat !important;
  background-size: cover !important;
}

html[${ROOT_ATTRIBUTE}="dark"] [${CHAT_SURFACE_ATTRIBUTE}] {
  background-image:
    linear-gradient(rgba(16, 24, 27, 0.74), rgba(16, 24, 27, 0.74)),
    var(${IMAGE_PROPERTY}) !important;
  background-position: center right !important;
  background-repeat: no-repeat !important;
  background-size: cover !important;
}

@media (min-width: 721px) {
  /* The stream and composer are siblings. Clear only their ancestor paths so
   * their nearest shared container can paint one continuous illustration. */
  html[${ROOT_ATTRIBUTE}] [${CHAT_CLEAR_ATTRIBUTE}] {
    background-color: transparent !important;
    background-image: none !important;
  }

  /* User-authored history and the real composer card use the same restrained
   * glass treatment. AI responses and the composer's outer layout stay clear. */
  html[${ROOT_ATTRIBUTE}] [data-testid="user-message"] > :first-child > :first-child,
  html[${ROOT_ATTRIBUTE}] [data-testid="message-input-root"] > div:has(
      [data-composer-input],
      [data-testid="composer-readonly-content"]
    ) {
    -webkit-backdrop-filter: blur(18px) saturate(1.16);
    backdrop-filter: blur(18px) saturate(1.16);
    background-clip: padding-box !important;
    border-style: solid !important;
    border-width: 1px !important;
  }

  html[${ROOT_ATTRIBUTE}="light"]
    [data-testid="user-message"] > :first-child > :first-child {
    background-color: rgba(255, 255, 255, 0.52) !important;
    border-color: rgba(43, 143, 138, 0.24) !important;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.72),
      0 8px 28px rgba(49, 105, 101, 0.12);
  }

  html[${ROOT_ATTRIBUTE}="light"]
    [data-testid="message-input-root"] > div:has(
      [data-composer-input],
      [data-testid="composer-readonly-content"]
    ) {
    background-color: rgba(255, 255, 255, 0.58) !important;
    border-color: rgba(43, 143, 138, 0.28) !important;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.76),
      0 10px 30px rgba(49, 105, 101, 0.14);
  }

  html[${ROOT_ATTRIBUTE}="dark"]
    [data-testid="user-message"] > :first-child > :first-child {
    background-color: rgba(18, 31, 34, 0.46) !important;
    border-color: rgba(101, 222, 210, 0.18) !important;
    box-shadow:
      inset 0 1px 0 rgba(101, 222, 210, 0.10),
      0 8px 28px rgba(0, 0, 0, 0.18);
  }

  html[${ROOT_ATTRIBUTE}="dark"]
    [data-testid="message-input-root"] > div:has(
      [data-composer-input],
      [data-testid="composer-readonly-content"]
    ) {
    background-color: rgba(18, 31, 34, 0.56) !important;
    border-color: rgba(101, 222, 210, 0.22) !important;
    box-shadow:
      inset 0 1px 0 rgba(101, 222, 210, 0.12),
      0 10px 30px rgba(0, 0, 0, 0.22);
  }

  /* CodeMirror normally paints an opaque editor and gutter. Only those two
   * layers are cleared, leaving the rest of the file pane unchanged. A
   * selected Markdown preview paints on its file-pane root because Paseo's
   * preview renderer intentionally has no dedicated DOM identifier. */
  html[${ROOT_ATTRIBUTE}="light"] [data-testid="file-source-editor"],
  html[${ROOT_ATTRIBUTE}="light"]
    [data-testid="workspace-file-pane"]:has(
      [data-testid="file-mode-preview"][aria-selected="true"]
    ) {
    background-image:
      linear-gradient(rgba(247, 252, 251, 0.72), rgba(247, 252, 251, 0.72)),
      var(${IMAGE_PROPERTY}) !important;
    background-position: center right !important;
    background-repeat: no-repeat !important;
    background-size: cover !important;
  }

  html[${ROOT_ATTRIBUTE}="dark"] [data-testid="file-source-editor"],
  html[${ROOT_ATTRIBUTE}="dark"]
    [data-testid="workspace-file-pane"]:has(
      [data-testid="file-mode-preview"][aria-selected="true"]
    ) {
    background-image:
      linear-gradient(rgba(16, 24, 27, 0.74), rgba(16, 24, 27, 0.74)),
      var(${IMAGE_PROPERTY}) !important;
    background-position: center right !important;
    background-repeat: no-repeat !important;
    background-size: cover !important;
  }

  html[${ROOT_ATTRIBUTE}] [data-testid="file-source-editor"] .cm-editor,
  html[${ROOT_ATTRIBUTE}] [data-testid="file-source-editor"] .cm-scroller,
  html[${ROOT_ATTRIBUTE}] [data-testid="file-source-editor"] .cm-content,
  html[${ROOT_ATTRIBUTE}] [data-testid="file-source-editor"] .cm-gutters {
    background-color: transparent !important;
  }

  /* Paseo's diff is painted into an opaque canvas. A low-opacity overlay is
   * the only way to carry the illustration through without fading code text. */
  html[${ROOT_ATTRIBUTE}] [data-testid="git-diff-canvas-root"] {
    isolation: isolate;
  }

  html[${ROOT_ATTRIBUTE}] [data-testid="git-diff-canvas-root"]::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 6;
    pointer-events: none;
    background-image: var(${IMAGE_PROPERTY});
    background-position: center right;
    background-repeat: no-repeat;
    background-size: cover;
  }

  html[${ROOT_ATTRIBUTE}="light"] [data-testid="git-diff-canvas-root"]::after {
    opacity: 0.10;
    mix-blend-mode: multiply;
  }

  html[${ROOT_ATTRIBUTE}="dark"] [data-testid="git-diff-canvas-root"]::after {
    opacity: 0.14;
    mix-blend-mode: screen;
  }

  /* xterm paints an opaque WebGL/canvas surface, so making its surrounding
   * div transparent cannot reveal a wallpaper. A restrained, non-interactive
   * image layer keeps terminal glyphs and ANSI colors fully opaque. */
  html[${ROOT_ATTRIBUTE}] [data-testid="terminal-surface"] {
    isolation: isolate;
  }

  html[${ROOT_ATTRIBUTE}] [data-testid="terminal-surface"]::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 4;
    pointer-events: none;
    background-image: var(${IMAGE_PROPERTY});
    background-position: center right;
    background-repeat: no-repeat;
    background-size: cover;
  }

  html[${ROOT_ATTRIBUTE}="light"] [data-testid="terminal-surface"]::after {
    opacity: 0.18;
    mix-blend-mode: multiply;
  }

  html[${ROOT_ATTRIBUTE}="dark"] [data-testid="terminal-surface"]::after {
    opacity: 0.20;
    mix-blend-mode: screen;
  }
}

/* Compact layouts keep Paseo's original opaque surfaces. */
@media (max-width: 720px) {
  html[${ROOT_ATTRIBUTE}] [${CHAT_SURFACE_ATTRIBUTE}] {
    background-image: none !important;
  }
}
`;

function parseRgba(value: string): Rgba | null {
  const match = value.match(
    /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+))?\s*\)$/,
  );
  if (!match) return null;
  return [
    Number(match[1]),
    Number(match[2]),
    Number(match[3]),
    match[4] === undefined ? 1 : Number(match[4]),
  ];
}

function matchesMarker(
  color: Rgba,
  markers: readonly (readonly [number, number, number])[],
): boolean {
  if (color[3] < 0.1) return false;
  return markers.some(
    ([red, green, blue]) =>
      Math.abs(color[0] - red) <= 2 &&
      Math.abs(color[1] - green) <= 2 &&
      Math.abs(color[2] - blue) <= 2,
  );
}

function detectMikuMode(): WallpaperMode | null {
  const root = document.getElementById("root");
  if (!root) return null;

  const viewportArea = Math.max(1, window.innerWidth * window.innerHeight);
  const elements = [
    root,
    ...root.querySelectorAll<HTMLElement>("div, main, section, aside"),
  ];
  let lightScore = 0;
  let darkScore = 0;

  for (const element of elements.slice(0, 700)) {
    // The conversation receives our background CSS. Excluding it keeps the
    // enhancement from becoming evidence for itself after a theme change.
    if (element.matches('[data-testid="agent-chat-scroll"]')) continue;
    const rect = element.getBoundingClientRect();
    const area = Math.max(0, rect.width) * Math.max(0, rect.height);
    if (area < 4_000) continue;

    const color = parseRgba(window.getComputedStyle(element).backgroundColor);
    if (!color) continue;
    const weight = Math.min(4, Math.max(1, Math.round((area / viewportArea) * 8)));
    if (matchesMarker(color, LIGHT_MARKERS)) lightScore += weight;
    if (matchesMarker(color, DARK_MARKERS)) darkScore += weight;
  }

  if (lightScore === 0 && darkScore === 0) return null;
  return darkScore > lightScore ? "dark" : "light";
}

function clearChatSurfaceDecorations(elements: Set<HTMLElement>): void {
  for (const element of elements) {
    element.removeAttribute(CHAT_SURFACE_ATTRIBUTE);
    element.removeAttribute(CHAT_CLEAR_ATTRIBUTE);
  }
  elements.clear();
}

function depthToAncestor(
  descendant: HTMLElement,
  ancestor: HTMLElement,
  limit: number,
): number | null {
  let current: HTMLElement | null = descendant;
  let depth = 0;
  while (current && current !== ancestor && depth <= limit) {
    current = current.parentElement;
    depth += 1;
  }
  return current === ancestor && depth <= limit ? depth : null;
}

function markTransparentPath(
  descendant: HTMLElement,
  ancestor: HTMLElement,
  elements: Set<HTMLElement>,
): void {
  let current: HTMLElement | null = descendant;
  while (current && current !== ancestor) {
    current.setAttribute(CHAT_CLEAR_ATTRIBUTE, "");
    elements.add(current);
    current = current.parentElement;
  }
}

function findWorkspaceContentSurface(
  composer: HTMLElement,
  workspacePane: HTMLElement,
): HTMLElement {
  const paneRect = workspacePane.getBoundingClientRect();
  if (paneRect.width <= 0 || paneRect.height <= 0) return workspacePane;

  // The active conversation paints its FileDropZone-sized content shell, not
  // the outer workspace pane (which also includes the tab bar). Find the first
  // similarly full-sized ancestor whose other branch owns the empty content.
  const minimumWidth = paneRect.width * 0.7;
  const minimumHeight = Math.max(
    paneRect.height * 0.7,
    paneRect.height - 96,
  );
  let branch: HTMLElement = composer;
  let current = composer.parentElement;

  while (current && current !== workspacePane) {
    const rect = current.getBoundingClientRect();
    const hasContentBranch = [...current.children].some((child) => {
      if (!(child instanceof HTMLElement) || child === branch) return false;
      const childRect = child.getBoundingClientRect();
      return (
        childRect.width >= rect.width * 0.45 &&
        childRect.height >= Math.max(32, rect.height * 0.2)
      );
    });

    if (
      rect.width >= minimumWidth &&
      rect.height >= minimumHeight &&
      hasContentBranch
    ) {
      return current;
    }

    branch = current;
    current = current.parentElement;
  }

  return workspacePane;
}

function decorateChatSurfaces(elements: Set<HTMLElement>): void {
  const root = document.getElementById("root");
  if (!root) return;

  for (const chat of root.querySelectorAll<HTMLElement>(
    '[data-testid="agent-chat-scroll"]',
  )) {
    let shell = chat.parentElement;
    let chatDepth = 1;

    // Six levels is typical in Paseo 0.6.1. The small safety margin avoids
    // pairing a read-only subagent stream with an unrelated pane's composer.
    while (shell && shell !== root && chatDepth <= 8) {
      const composers = shell.querySelectorAll<HTMLElement>(
        '[data-testid="message-input-root"]',
      );
      const composer = [...composers].find(
        (candidate) => depthToAncestor(candidate, shell, 8) !== null,
      );
      if (composer) {
        shell.setAttribute(CHAT_SURFACE_ATTRIBUTE, "");
        elements.add(shell);
        markTransparentPath(chat, shell, elements);
        markTransparentPath(composer, shell, elements);
        break;
      }
      shell = shell.parentElement;
      chatDepth += 1;
    }
  }

  /* A newly opened Agent is a workspace draft until its first message is
   * submitted, so it has a composer but no agent-chat-scroll yet. Paint its
   * pane-sized content shell and clear only the composer's ancestor path.
   * Restricting the fallback to workspace panes avoids changing the New
   * Workspace screen and composers hosted in dialogs. */
  for (const composer of root.querySelectorAll<HTMLElement>(
    '[data-testid="message-input-root"]',
  )) {
    if (composer.closest(`[${CHAT_SURFACE_ATTRIBUTE}]`)) continue;

    const workspacePane = composer.closest<HTMLElement>(
      '[data-testid^="workspace-pane-"]',
    );
    if (!workspacePane) continue;

    const surface = findWorkspaceContentSurface(composer, workspacePane);
    surface.setAttribute(CHAT_SURFACE_ATTRIBUTE, "");
    elements.add(surface);
    markTransparentPath(composer, surface, elements);
  }
}

function dataUrlToBlobUrl(dataUrl: string): string | null {
  if (
    typeof Blob === "undefined" ||
    typeof atob !== "function" ||
    typeof URL === "undefined" ||
    typeof URL.createObjectURL !== "function"
  ) {
    return null;
  }

  const match = /^data:([^;,]+);base64,(.+)$/.exec(dataUrl);
  if (!match) return null;

  try {
    const binary = atob(match[2]);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return URL.createObjectURL(new Blob([bytes], { type: match[1] }));
  } catch {
    return null;
  }
}

function createWallpaperImageUrls(): WallpaperImageUrls {
  // The original PNG data URLs are larger than Chromium's roughly 2 MiB URL
  // ceiling. Blob URLs keep every source byte while giving CSS a short URL.
  const createdUrls: string[] = [];
  const createUrl = (dataUrl: string) => {
    const blobUrl = dataUrlToBlobUrl(dataUrl);
    if (blobUrl) createdUrls.push(blobUrl);
    return blobUrl ?? dataUrl;
  };

  return {
    light: createUrl(LIGHT_BACKGROUND_DATA_URL),
    dark: createUrl(DARK_BACKGROUND_DATA_URL),
    revoke() {
      for (const url of createdUrls) URL.revokeObjectURL(url);
      createdUrls.length = 0;
    },
  };
}

function applyMode(
  layer: HTMLDivElement,
  mode: WallpaperMode | null,
  imageUrls: WallpaperImageUrls,
): void {
  if (mode === null) {
    document.documentElement.removeAttribute(ROOT_ATTRIBUTE);
    document.documentElement.style.removeProperty(IMAGE_PROPERTY);
    delete layer.dataset.mode;
    return;
  }

  document.documentElement.setAttribute(ROOT_ATTRIBUTE, mode);
  document.documentElement.style.setProperty(
    IMAGE_PROPERTY,
    `url("${imageUrls[mode]}")`,
  );
  layer.dataset.mode = mode;
}

/**
 * Install a self-cleaning wallpaper controller while returning the untouched
 * theme contribution expected by plugin.addTheme().
 */
export function installMikuBackground(
  theme: PluginThemeContribution,
): PluginThemeContribution {
  if (typeof document === "undefined") return theme;

  const previousLayer = document.getElementById(LAYER_ID);
  const previousCleanup = previousLayer ? Reflect.get(previousLayer, CLEANUP_PROPERTY) : null;
  if (typeof previousCleanup === "function") previousCleanup();

  document.getElementById(STYLE_ID)?.remove();
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = WALLPAPER_CSS;
  document.head.append(style);

  const layer = document.createElement("div");
  layer.id = LAYER_ID;
  layer.setAttribute("aria-hidden", "true");
  document.body.prepend(layer);

  const imageUrls = createWallpaperImageUrls();
  let timer: number | null = null;
  let stopped = false;
  const decoratedElements = new Set<HTMLElement>();
  const update = () => {
    timer = null;
    if (stopped) return;
    clearChatSurfaceDecorations(decoratedElements);
    const mode = detectMikuMode();
    applyMode(layer, mode, imageUrls);
    if (mode !== null) decorateChatSurfaces(decoratedElements);
  };
  const scheduleUpdate = (delay = 80) => {
    if (timer !== null) window.clearTimeout(timer);
    timer = window.setTimeout(update, delay);
  };

  const observer = new MutationObserver(() => scheduleUpdate());
  observer.observe(document.head, {
    attributes: true,
    characterData: true,
    childList: true,
    subtree: true,
  });
  const root = document.getElementById("root");
  if (root) {
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["class"],
      childList: true,
      subtree: true,
    });
  }

  const handleInteraction = () => scheduleUpdate(180);
  const handleKeyboardInteraction = (event: KeyboardEvent) => {
    // Theme menus can be operated with these keys. Ignore ordinary typing so
    // composing a message never causes repeated style scans.
    if (
      event.key === "Enter" ||
      event.key === " " ||
      event.key === "ArrowUp" ||
      event.key === "ArrowDown" ||
      event.key === "Home" ||
      event.key === "End" ||
      event.key === "Escape" ||
      event.key === "Tab"
    ) {
      scheduleUpdate(180);
    }
  };
  document.addEventListener("click", handleInteraction, true);
  document.addEventListener("keyup", handleKeyboardInteraction, true);

  // Detect an already-applied theme immediately, then retry after Paseo has
  // restored the persisted appearance preference.
  update();
  const startupTimer = window.setTimeout(update, 600);

  const cleanup = () => {
    if (stopped) return;
    stopped = true;
    if (timer !== null) window.clearTimeout(timer);
    window.clearTimeout(startupTimer);
    observer.disconnect();
    document.removeEventListener("click", handleInteraction, true);
    document.removeEventListener("keyup", handleKeyboardInteraction, true);
    document.documentElement.removeAttribute(ROOT_ATTRIBUTE);
    document.documentElement.style.removeProperty(IMAGE_PROPERTY);
    clearChatSurfaceDecorations(decoratedElements);
    imageUrls.revoke();
    style.remove();
    layer.remove();
  };
  Reflect.set(layer, CLEANUP_PROPERTY, cleanup);

  return theme;
}
