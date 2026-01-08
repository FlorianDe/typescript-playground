// ============================================================================
// SPA TypeScript Engine
// ============================================================================

import {
  signal,
  effect,
  type Signal,
} from "@preact/signals-core";

// ============================================================================
// SECTION: Type Definitions
// ============================================================================

/**
 * Async signal with loading, error, and data states
 */
export interface AsyncSignal<T> {
  readonly loading: Signal<boolean>;
  readonly error: Signal<Error | null>;
  readonly data: Signal<T | null>;
  readonly refetch: () => Promise<void>;
}

/**
 * Effect cleanup function
 */
export type EffectCleanup = () => void;

/**
 * Component function type
 */
export type Component<P = Record<string, unknown>> = (props: P) => JSX.Element;

/**
 * Child element types supported in JSX
 */
export type Child =
  | JSX.Element
  | string
  | number
  | boolean
  | null
  | undefined
  | Signal<unknown>
  | Child[];

/**
 * Props for HTML elements
 */
export interface ElementProps {
  children?: Child | Child[];
  class?: string | Signal<string>;
  className?: string | Signal<string>;
  id?: string | Signal<string>;
  style?: Partial<CSSStyleDeclaration> | string;

  // Event handlers
  onClick?: (e: MouseEvent) => void;
  onInput?: (e: Event) => void;
  onChange?: (e: Event) => void;
  onSubmit?: (e: Event) => void;
  onFocus?: (e: FocusEvent) => void;
  onBlur?: (e: FocusEvent) => void;
  onKeyDown?: (e: KeyboardEvent) => void;
  onKeyUp?: (e: KeyboardEvent) => void;
  onMouseEnter?: (e: MouseEvent) => void;
  onMouseLeave?: (e: MouseEvent) => void;

  // Other common attributes
  [key: string]: unknown;
}

/**
 * JSX types
 */
declare global {
  namespace JSX {
    type Element = HTMLElement | DocumentFragment | Text;

    type IntrinsicElements = Record<
      keyof HTMLElementTagNameMap,
      ElementProps & Record<string, any> // not the exact type but way smaller
    >;

    interface ElementChildrenAttribute {
      children: {};
    }
  }
}

// ============================================================================
// SECTION: Async Signal (Custom Extension)
// ============================================================================

/**
 * Check if a value is a signal
 */
function isSignal(value: unknown): value is Signal<unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    "value" in value &&
    "peek" in value
  );
}

/**
 * Create an async signal for data fetching
 */
export function asyncSignal<T>(fn: () => Promise<T>): AsyncSignal<T> {
  const loading = signal(false);
  const error = signal<Error | null>(null);
  const data = signal<T | null>(null);

  const execute = async () => {
    loading.value = true;
    error.value = null;

    try {
      const result = await fn();
      data.value = result;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
    } finally {
      loading.value = false;
    }
  };

  // Execute immediately
  execute();

  return {
    loading,
    error,
    data,
    refetch: execute,
  };
}

// ============================================================================
// SECTION: JSX Runtime
// ============================================================================

/**
 * Fragment component for multiple root elements
 */
export function Fragment({
  children,
}: {
  children?: Child | Child[];
}): DocumentFragment {
  const fragment = document.createDocumentFragment();
  appendChildren(fragment, Array.isArray(children) ? children : [children]);
  return fragment;
}

/**
 * Show component for conditional rendering with signals
 */
export function Show<T>({
  when,
  children,
  fallback,
}: {
  when: Signal<T> | T;
  children: ((value: NonNullable<T>) => JSX.Element) | JSX.Element | Child[];
  fallback?: JSX.Element;
}): JSX.Element {
  const container = document.createElement("div");

  effect(() => {
    const condition = isSignal(when) ? when.value : when;

    // Clear container
    container.innerHTML = "";

    if (condition) {
      // Handle children - could be a function, an element, or an array
      let actualChildren = children;

      // If children is an array with a single function, unwrap it
      if (
        Array.isArray(children) &&
        children.length === 1 &&
        typeof children[0] === "function"
      ) {
        actualChildren = children[0];
      }

      if (typeof actualChildren === "function") {
        // Callback children
        const element = actualChildren(condition as NonNullable<T>);
        container.appendChild(element);
      } else {
        // Direct JSX children (might be array from JSX transform)
        appendChildren(
          container,
          Array.isArray(actualChildren) ? actualChildren : [actualChildren]
        );
      }
    } else if (fallback) {
      container.appendChild(fallback);
    }
  });

  return container;
}

/**
 * JSX factory function (old transform: children as arguments)
 */
export function jsx(
  type: string | Component,
  props: ElementProps | null,
  ...children: Child[]
): JSX.Element {
  props = props || {};

  // Handle children from props (for tests/manual usage) or rest parameters (from JSX transform)
  const finalChildren = children.length > 0 ? children : props.children;
  const propsWithoutChildren = { ...props };
  delete propsWithoutChildren.children;

  // Handle component functions
  if (typeof type === "function") {
    return type({ ...propsWithoutChildren, children: finalChildren });
  }

  // Create DOM element
  const element = document.createElement(type);

  // Apply props (excluding children)
  applyProps(element, propsWithoutChildren);

  // Append children
  if (finalChildren !== undefined) {
    appendChildren(
      element,
      Array.isArray(finalChildren) ? finalChildren : [finalChildren]
    );
  }

  return element;
}

/**
 * JSX factory for elements with static children (optimization for compiled JSX)
 */
export function jsxs(
  type: string | Component,
  props: ElementProps | null
): JSX.Element {
  return jsx(type, props);
}

/**
 * Apply props to a DOM element
 */
function applyProps(
  element: HTMLElement,
  props: Omit<ElementProps, "children">
): void {
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null) continue;

    // Handle event listeners
    if (key.startsWith("on") && typeof value === "function") {
      const eventName = key.slice(2).toLowerCase();
      element.addEventListener(eventName, value as EventListener);
    }
    // Handle className/class
    else if (key === "className" || key === "class") {
      if (isSignal(value)) {
        // Reactive class
        effect(() => {
          element.className = String(value.value);
        });
      } else {
        element.className = String(value);
      }
    }
    // Handle style object
    else if (key === "style" && typeof value === "object") {
      Object.assign(element.style, value);
    }
    // Handle style string
    else if (key === "style" && typeof value === "string") {
      element.setAttribute("style", value);
    }
    // Handle htmlFor -> for
    else if (key === "htmlFor") {
      element.setAttribute("for", String(value));
    }
    // Handle boolean attributes
    else if (typeof value === "boolean") {
      if (value) {
        element.setAttribute(key, "");
      }
    }
    // Handle signal attributes
    else if (isSignal(value)) {
      effect(() => {
        element.setAttribute(key, String(value.value));
      });
    }
    // Handle regular attributes
    else {
      element.setAttribute(key, String(value));
    }
  }
}

/**
 * Append children to a parent element
 */
function appendChildren(
  parent: HTMLElement | DocumentFragment,
  children: Child[]
): void {
  for (const child of children) {
    appendChild(parent, child);
  }
}

/**
 * Append a single child to parent
 */
function appendChild(
  parent: HTMLElement | DocumentFragment,
  child: Child
): void {
  if (child === null || child === undefined || typeof child === "boolean") {
    // Skip null, undefined, and boolean values
    return;
  }

  if (Array.isArray(child)) {
    // Recursively append array children
    appendChildren(parent, child);
  } else if (isSignal(child)) {
    // Create reactive text node for signal
    const textNode = document.createTextNode(String(child.value));
    parent.appendChild(textNode);

    // Update text when signal changes
    effect(() => {
      textNode.textContent = String(child.value);
    });
  } else if (typeof child === "string" || typeof child === "number") {
    // Append text node
    parent.appendChild(document.createTextNode(String(child)));
  } else if (child instanceof Node) {
    // Append DOM node
    parent.appendChild(child);
  } else {
    console.warn("Unknown child type:", typeof child, child);
  }
}


// ============================================================================
// SECTION: Style Utilities
// ============================================================================

/**
 * Scoped style result
 */
export interface ScopedStyle {
  id: string;
  element: HTMLStyleElement;
}

let scopeCounter = 0;

/**
 * Create scoped CSS styles
 */
export function css(
  strings: TemplateStringsArray,
  ...values: unknown[]
): ScopedStyle {
  const scopeId = `scope-${scopeCounter++}`;

  // Build CSS text
  const cssText = strings.reduce((acc, str, i) => {
    return acc + str + (values[i] !== undefined ? String(values[i]) : "");
  }, "");

  // Add scope attribute to selectors
  const scopedCSS = cssText.replace(
    /([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)/g,
    `[data-scope="${scopeId}"] $1$2`
  );

  // Inject style
  const style = document.createElement("style");
  style.textContent = scopedCSS;
  document.head.appendChild(style);

  return { id: scopeId, element: style };
}

/**
 * Embed HTML with style isolation using Shadow DOM
 */
export function isolatedHTML(
  html: string,
  includeGlobalStyles = false
): HTMLElement {
  const container = document.createElement("div");
  const shadow = container.attachShadow({ mode: "open" });

  // Clone global styles if requested
  if (includeGlobalStyles) {
    const globalStyles = document.querySelectorAll(
      'link[rel="stylesheet"], style'
    );
    globalStyles.forEach((style) => {
      const cloned = style.cloneNode(true) as HTMLElement;
      shadow.appendChild(cloned);
    });
  }

  // Create wrapper for HTML content
  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;
  shadow.appendChild(wrapper);

  return container;
}

// ============================================================================
// SECTION 6: Public API Exports
// ============================================================================

// All exports are already declared with `export` keyword above
// This section is just for clarity of what's public
