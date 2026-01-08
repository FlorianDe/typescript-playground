# SPA TypeScript Engine

A minimal SPA framework with TC39-compliant signals (@preact/signals), type-safe routing, and JSX support.

## Features

- **TC39 Signals**: Built on [@preact/signals-core](https://github.com/preactjs/signals) - battle-tested, standards-compliant reactive primitives
- **Type-Safe Routing**: Route parameters are fully typed with pattern matching
- **JSX/TSX Support**: Write components with familiar JSX syntax via Vite
- **Async Data Fetching**: Built-in `asyncSignal` with loading/error/data states
- **Style Isolation**: Shadow DOM for embedding legacy HTML without style conflicts
- **Tailwind CSS 4**: Seamless integration with Tailwind
- **No Virtual DOM**: Direct DOM manipulation for simplicity and minimal code
- **Minimal Core**: Lean engine leveraging proven signal implementation

## Installation

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Quick Start

### 1. Signals (Reactive State)

```tsx
import { signal, computed, effect } from './spa-engine';

// Create a signal
const count = signal(0);

// Read value
console.log(count.value); // 0

// Update value
count.value++;

// Computed values
const doubled = computed(() => count.value * 2);
console.log(doubled.value); // 2

// Effects
effect(() => {
  console.log('Count is:', count.value);
});
```

### 2. Components with JSX

```tsx
function Counter() {
  const count = signal(0);

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={() => count.value++}>
        Increment
      </button>
    </div>
  );
}
```

### 3. Async Data Fetching

```tsx
import { asyncSignal } from './spa-engine';

function UserProfile({ id }: { id: string }) {
  const user = asyncSignal(async () => {
    const response = await fetch(`/api/users/${id}`);
    return response.json();
  });

  return (
    <div>
      {user.loading.value && <p>Loading...</p>}
      {user.error.value && <p>Error: {user.error.value.message}</p>}
      {user.data.value && <h1>{user.data.value.name}</h1>}
    </div>
  );
}
```

### 4. Type-Safe Routing

```tsx
import { createRouter, route, match } from './spa-engine';

// Define routes
const routes = {
  home: route('/'),
  user: route('/user/:id'),
  post: route('/post/:postId'),
};

// Create router
const router = createRouter({
  routes,
  strategy: 'browser', // or 'hash' or 'memory'
});

// Navigate (type-safe!)
router.navigate(routes.user, { id: '123' });

// Match routes to components
function App() {
  return (
    <div>
      {match(router.current, {
        '/': () => <HomePage />,
        '/user/:id': ({ params }) => <UserPage id={params.id} />,
        '/post/:postId': ({ params }) => <PostPage postId={params.postId} />,
      })}
    </div>
  );
}
```

### 5. Style Isolation

```tsx
import { isolatedHTML } from './spa-engine';

function LegacyWidget() {
  const legacyHTML = `
    <style>
      .widget { background: yellow; }
    </style>
    <div class="widget">
      Legacy content with isolated styles
    </div>
  `;

  return (
    <div>
      <h1>My App</h1>
      {isolatedHTML(legacyHTML)}
    </div>
  );
}
```

## API Reference

### Signals

#### `signal<T>(initialValue: T): Signal<T>`

Create a reactive signal.

```tsx
const count = signal(0);
count.value = 5;
console.log(count.value); // 5
console.log(count.peek()); // 5 (without tracking)
```

#### `computed<T>(fn: () => T): Signal<T>`

Create a computed signal that derives from other signals.

```tsx
const count = signal(2);
const doubled = computed(() => count.value * 2);
console.log(doubled.value); // 4
```

#### `effect(fn: () => void | (() => void)): () => void`

Run side effects when dependencies change.

```tsx
const count = signal(0);

const dispose = effect(() => {
  console.log('Count:', count.value);

  // Optional cleanup function
  return () => {
    console.log('Cleanup');
  };
});

// Stop the effect
dispose();
```

#### `asyncSignal<T>(fn: () => Promise<T>): AsyncSignal<T>`

Create an async signal for data fetching.

```tsx
const user = asyncSignal(async () => {
  const res = await fetch('/api/user');
  return res.json();
});

user.loading.value; // boolean
user.error.value;   // Error | null
user.data.value;    // T | null
user.refetch();     // () => Promise<void>
```

### Routing

#### `route<Path>(path: Path): Route<Path>`

Define a route with parameters.

```tsx
const userRoute = route('/user/:id');
const postRoute = route('/user/:userId/post/:postId');
```

#### `createRouter(config: RouterConfig): Router`

Create a router instance.

```tsx
const router = createRouter({
  routes: {
    home: route('/'),
    user: route('/user/:id'),
  },
  strategy: 'browser', // 'browser' | 'hash' | 'memory'
  onNavigate: (to, from) => {
    console.log('Navigated to:', to.path);
  },
});
```

#### `router.navigate(path: string | Route, params?: Record<string, string>)`

Navigate to a route.

```tsx
router.navigate('/user/123');
router.navigate(routes.user, { id: '123' });
```

#### `router.beforeEach(guard: NavigationGuard): () => void`

Register a navigation guard.

```tsx
router.beforeEach((to, from, next) => {
  if (requiresAuth(to) && !isAuthenticated()) {
    next('/login');
  } else {
    next();
  }
});
```

#### `match(currentRoute: Signal<RouteMatch>, routes: Record<string, (match: RouteMatch) => JSX.Element>): JSX.Element`

Match routes to components.

```tsx
match(router.current, {
  '/': () => <HomePage />,
  '/user/:id': ({ params }) => <UserPage id={params.id} />,
  '*': () => <NotFoundPage />,
});
```

### Styling

#### `css(strings: TemplateStringsArray, ...values: unknown[]): ScopedStyle`

Create scoped CSS styles.

```tsx
const styles = css`
  .my-component {
    background: blue;
  }
`;

<div data-scope={styles.id} class="my-component">
  Styled content
</div>
```

#### `isolatedHTML(html: string, includeGlobalStyles?: boolean): HTMLElement`

Embed HTML with style isolation using Shadow DOM.

```tsx
const widget = isolatedHTML(`
  <style>.widget { color: red; }</style>
  <div class="widget">Isolated widget</div>
`);
```

### JSX

#### `Fragment`

Create a fragment for multiple root elements.

```tsx
<>
  <div>First</div>
  <div>Second</div>
</>
```

## Project Structure

```
spa-ts-engine/
├── src/
│   ├── spa-engine.ts      # Main engine (single file, ~1300 lines)
│   ├── jsx-runtime.ts     # JSX runtime re-exports
│   └── main.tsx           # Example application
├── tests/
│   ├── signals.test.ts    # Signal system tests
│   ├── router.test.ts     # Router tests
│   └── jsx.test.ts        # JSX rendering tests
├── index.html             # Entry point
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config with JSX
├── vite.config.ts         # Vite config
└── README.md              # This file
```

## Philosophy

This framework prioritizes **minimalism** and **simplicity** over complex optimizations:

- **Lean core**: Uses @preact/signals for proven, standards-compliant reactivity
- **Direct DOM manipulation**: No virtual DOM complexity
- **Battle-tested signals**: TC39 proposal implementation with automatic dependency tracking
- **Type safety everywhere**: Leverage TypeScript fully
- **Modern browsers only**: No legacy browser support

Perfect for small to medium-sized applications where developer experience and code clarity matter most.

## Development

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run tests once
npm run test:run

# Type check
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

Requires support for:
- Proxy (for signals)
- ES2022 features
- Shadow DOM (for style isolation)

## License

MIT

## Credits

Built with:
- [@preact/signals-core](https://github.com/preactjs/signals) - TC39 Signals implementation
- TypeScript 5.x
- Vite
- Vitest
