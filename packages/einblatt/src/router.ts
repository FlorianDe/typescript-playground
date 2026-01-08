import { signal, effect, type Signal } from "@preact/signals-core";

/**
 * Route definition with path pattern
 */
export interface Route<Path extends string = string> {
  path: Path;
  pattern: RegExp;
  keys: string[];
}

/**
 * Matched route with extracted parameters
 */
export interface RouteMatch {
  path: string;
  params: Record<string, string>;
  route?: Route;
}

/**
 * Router strategy interface for different routing modes
 */
export interface RouterStrategy {
  getCurrentPath(): string;
  navigate(path: string): void;
  listen(callback: (path: string) => void): () => void;
}

/**
 * Router configuration
 */
export interface RouterConfig {
  routes: Record<string, Route>;
  strategy: "browser" | "hash" | "memory";
  basename?: string;
  onNavigate?: (to: RouteMatch, from: RouteMatch) => void;
}

/**
 * Navigation guard next function
 */
export type NavigationGuardNext = (route?: Route | string) => void;

/**
 * Navigation guard function
 */
export type NavigationGuard = (
  to: RouteMatch,
  from: RouteMatch,
  next: NavigationGuardNext
) => void;

// ============================================================================
// SECTION 4: Router System
// ============================================================================

/**
 * Create a route definition
 */
export function route<Path extends string>(path: Path): Route<Path> {
  const keys: string[] = [];

  // Convert path pattern to regex
  // /user/:id/post/:postId -> ^\/user\/([^/]+)\/post\/([^/]+)$
  const pattern = new RegExp(
    "^" +
      path
        .replace(/\*/g, ".*") // * -> .*
        .replace(/:([^/]+)/g, (_, key) => {
          keys.push(key);
          return "([^/]+)";
        }) +
      "$"
  );

  return { path, pattern, keys };
}

/**
 * Browser router strategy using History API
 */
class BrowserRouterStrategy implements RouterStrategy {
  private basename: string;

  constructor(basename = "") {
    this.basename = basename.replace(/\/$/, ""); // Remove trailing slash
  }

  getCurrentPath(): string {
    const pathname = window.location.pathname;
    // Strip basename from pathname
    if (this.basename && pathname.startsWith(this.basename)) {
      return pathname.slice(this.basename.length) || "/";
    }
    return pathname;
  }

  navigate(path: string): void {
    const fullPath = this.basename + path;
    window.history.pushState({}, "", fullPath);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  listen(callback: (path: string) => void): () => void {
    const handler = () => callback(this.getCurrentPath());
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }
}

/**
 * Hash router strategy using URL hash
 */
class HashRouterStrategy implements RouterStrategy {
  getCurrentPath(): string {
    return window.location.hash.slice(1) || "/";
  }

  navigate(path: string): void {
    window.location.hash = path;
  }

  listen(callback: (path: string) => void): () => void {
    const handler = () => callback(this.getCurrentPath());
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }
}

/**
 * Memory router strategy for testing (no browser APIs)
 */
class MemoryRouterStrategy implements RouterStrategy {
  private path = "/";
  private listeners: Array<(path: string) => void> = [];

  getCurrentPath(): string {
    return this.path;
  }

  navigate(path: string): void {
    this.path = path;
    this.listeners.forEach((listener) => listener(path));
  }

  listen(callback: (path: string) => void): () => void {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
}

/**
 * Router class for managing navigation
 */
export class Router {
  private strategy: RouterStrategy;
  private routes: Record<string, Route>;
  private guards: NavigationGuard[] = [];
  private unlisten?: () => void;

  public current: Signal<RouteMatch>;

  constructor(config: RouterConfig) {
    this.routes = config.routes;

    // Create strategy
    this.strategy = this.createStrategy(config.strategy, config.basename);

    // Initialize current route
    const initialMatch = this.matchRoute(this.strategy.getCurrentPath());
    this.current = signal(initialMatch);

    // Listen to route changes
    this.unlisten = this.strategy.listen((path) => {
      this.handleNavigation(path);
    });

    // Call onNavigate callback
    if (config.onNavigate) {
      effect(() => {
        const to = this.current.value;
        config.onNavigate!(to, to);
      });
    }
  }

  private createStrategy(type: "browser" | "hash" | "memory", basename?: string): RouterStrategy {
    switch (type) {
      case "browser":
        return new BrowserRouterStrategy(basename);
      case "hash":
        return new HashRouterStrategy();
      case "memory":
        return new MemoryRouterStrategy();
    }
  }

  /**
   * Navigate to a route
   */
  navigate(pathOrRoute: string | Route, params?: Record<string, string>): void {
    const path =
      typeof pathOrRoute === "string"
        ? pathOrRoute
        : this.buildPath(pathOrRoute, params || {});

    this.strategy.navigate(path);
  }

  /**
   * Build path from route and params
   */
  private buildPath(route: Route, params: Record<string, string>): string {
    let path = route.path;
    for (const [key, value] of Object.entries(params)) {
      path = path.replace(`:${key}`, value);
    }
    return path;
  }

  /**
   * Match a path against registered routes
   */
  private matchRoute(path: string): RouteMatch {
    for (const route of Object.values(this.routes)) {
      const match = path.match(route.pattern);
      if (match) {
        const params: Record<string, string> = {};
        route.keys.forEach((key, index) => {
          params[key] = match[index + 1]!;
        });

        return { path, params, route };
      }
    }

    // No match found
    return { path, params: {} };
  }

  /**
   * Handle navigation to new path
   */
  private handleNavigation(path: string): void {
    const from = this.current.peek();
    const to = this.matchRoute(path);

    // Run guards
    if (this.guards.length > 0) {
      this.runGuards(to, from, () => {
        this.current.value = to;
      });
    } else {
      this.current.value = to;
    }
  }

  /**
   * Run navigation guards
   */
  private runGuards(
    to: RouteMatch,
    from: RouteMatch,
    finalNext: () => void
  ): void {
    let guardIndex = 0;

    const next: NavigationGuardNext = (route) => {
      if (route) {
        // Redirect to different route
        if (typeof route === "string") {
          this.navigate(route);
        } else {
          this.navigate(route);
        }
        return;
      }

      if (guardIndex < this.guards.length) {
        const guard = this.guards[guardIndex++]!;
        guard(to, from, next);
      } else {
        finalNext();
      }
    };

    next();
  }

  /**
   * Register a navigation guard
   */
  beforeEach(guard: NavigationGuard): () => void {
    this.guards.push(guard);
    return () => {
      const index = this.guards.indexOf(guard);
      if (index > -1) {
        this.guards.splice(index, 1);
      }
    };
  }

  /**
   * Clean up router
   */
  destroy(): void {
    if (this.unlisten) {
      this.unlisten();
    }
  }
}

/**
 * Create a router instance
 */
export function createRouter(config: RouterConfig): Router {
  return new Router(config);
}

/**
 * Match routes to components
 */
export function match(
  currentRoute: Signal<RouteMatch>,
  routes: Record<string, (match: RouteMatch) => JSX.Element>
): JSX.Element {
  const container = document.createElement("div");
  let lastPath = "";

  effect(() => {
    const route = currentRoute.value;

    // Only re-render if the path actually changed
    if (route.path === lastPath) {
      return;
    }
    lastPath = route.path;

    console.log("Route changed to:", route.path);

    // Find matching route handler
    for (const [pattern, handler] of Object.entries(routes)) {
      const routeRegex = new RegExp(
        "^" + pattern.replace(/\*/g, ".*").replace(/:([^/]+)/g, "([^/]+)") + "$"
      );

      if (routeRegex.test(route.path)) {
        // Clear container
        container.innerHTML = "";

        // Render new component
        const element = handler(route);
        container.appendChild(element);
        break;
      }
    }
  });

  return container;
}
