// Typecheck-only ambient DOM surface for the web wallpaper enhancement.
// Paseo plugins compile without the DOM library, so declare exactly what
// client/background.ts touches. Every runtime entry point in that module
// guards on `typeof document === "undefined"` (or Blob/URL/atob presence),
// which keeps native hosts on the no-op path. This file ships no runtime
// code; the Paseo bundler never reaches it.

interface MikuCssStyleDeclaration {
  setProperty(name: string, value: string): void;
  removeProperty(name: string): void;
}

interface MikuDomRect {
  readonly width: number;
  readonly height: number;
  readonly left: number;
}

interface MikuMutationObserverInit {
  attributes?: boolean;
  childList?: boolean;
  subtree?: boolean;
  attributeFilter?: string[];
}

interface Element {
  id: string;
  textContent: string | null;
  setAttribute(name: string, value: string): void;
  getAttribute(name: string): string | null;
  removeAttribute(name: string): void;
  remove(): void;
  prepend(node: Element): void;
  append(node: Element): void;
  closest<T extends Element = Element>(selector: string): T | null;
  matches(selector: string): boolean;
  querySelector<T extends Element = Element>(selector: string): T | null;
  querySelectorAll<T extends Element = Element>(selector: string): T[];
  getBoundingClientRect(): MikuDomRect;
  readonly parentElement: HTMLElement | null;
  readonly children: HTMLElement[];
}

interface HTMLElement extends Element {
  dataset: Record<string, string>;
  readonly style: MikuCssStyleDeclaration;
}

interface HTMLDivElement extends HTMLElement {}

interface KeyboardEvent {
  readonly key: string;
}

interface MutationRecord {
  readonly type: string;
  readonly target: Element;
  readonly addedNodes: readonly unknown[];
  readonly removedNodes: readonly unknown[];
}

interface MutationObserver {
  observe(target: Element, options?: MikuMutationObserverInit): void;
  disconnect(): void;
}

declare var HTMLElement: {
  prototype: HTMLElement;
  new (): HTMLElement;
};

declare var MutationObserver: {
  prototype: MutationObserver;
  new (callback: (records: MutationRecord[], observer: MutationObserver) => void): MutationObserver;
};

declare const document: {
  getElementById(id: string): HTMLElement | null;
  querySelector(selector: string): HTMLElement | null;
  readonly documentElement: HTMLElement;
  readonly head: Element;
  readonly body: Element;
  createElement(tagName: "div"): HTMLDivElement;
  createElement(tagName: string): HTMLElement;
  addEventListener(
    type: string,
    listener: (event: KeyboardEvent) => void,
    capture?: boolean,
  ): void;
  removeEventListener(
    type: string,
    listener: (event: KeyboardEvent) => void,
    capture?: boolean,
  ): void;
};

declare const window: {
  setTimeout(handler: () => void, timeout: number): number;
  clearTimeout(id: number): void;
  readonly innerWidth: number;
  readonly innerHeight: number;
  getComputedStyle(element: Element): { readonly backgroundColor: string };
  addEventListener(type: string, listener: () => void): void;
  removeEventListener(type: string, listener: () => void): void;
};

declare const URL: {
  createObjectURL(blob: object): string;
  revokeObjectURL(url: string): void;
};

declare const Blob: {
  new (parts: Uint8Array[], options?: { type?: string }): object;
};

declare function atob(data: string): string;
