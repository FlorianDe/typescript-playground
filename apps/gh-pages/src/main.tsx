import html from "../../../packages/browser/graphics/web/projection-3d-to-2d/index.html?raw";

/**
 * Example Application
 * Demonstrates all features of the SPA TS Engine
 */

import {
  computed,
  effect,
  signal,
  createRouter,
  match,
  route,
  asyncSignal,
  isolatedHTML,
  Show,
} from "@repo/einblatt";

// ============================================================================
// Routes Definition
// ============================================================================

const routes = {
  home: route("/"),
  counter: route("/counter"),
  async: route("/async/:userId"),
  isolated: route("/isolated"),
  about: route("/about"),
  notFound: route("*"),
} as const;

// Create router
const router = createRouter({
  routes,
  strategy: "browser",
  basename: import.meta.env.BASE_URL,
  onNavigate: (to, from) => {
    console.log("Navigating from", from.path, "to", to.path);
  },
});

// Add navigation guard example
router.beforeEach((to, from, next) => {
  console.log("Navigation guard:", from.path, "->", to.path);
  next(); // Allow navigation
});

// ============================================================================
// Components
// ============================================================================

/**
 * Navigation component
 */
function Navigation() {
  const NavLink = ({ href, children }: { href: string; children: string }) => {
    const className = computed(() =>
      router.current.value.path === href
        ? "text-blue-600 font-bold"
        : "text-gray-600 hover:text-blue-500"
    );

    return (
      <a
        href={href}
        class={className}
        onClick={(e) => {
          e.preventDefault();
          router.navigate(href);
        }}
      >
        {children}
      </a>
    );
  };

  return (
    <nav class="bg-gray-800 text-white p-4 mb-8">
      <div class="container mx-auto flex gap-6">
        <NavLink href="/">Home</NavLink>
        <NavLink href="/counter">Counter</NavLink>
        <NavLink href="/async/123">Async Data</NavLink>
        <NavLink href="/isolated">Style Isolation</NavLink>
        <NavLink href="/about">About</NavLink>
      </div>
    </nav>
  );
}

/**
 * Home Page
 */
function HomePage() {
  const message = signal("Welcome to SPA TS Engine!");

  return (
    <div class="container mx-auto px-4">
      <h1 class="text-4xl font-bold mb-6">{message}</h1>

      <div class="space-y-4">
        <p class="text-lg text-gray-700">
          A minimal TypeScript SPA framework with:
        </p>

        <ul class="list-disc list-inside space-y-2 text-gray-700">
          <li>Signal-based reactivity</li>
          <li>Type-safe routing with parameters</li>
          <li>JSX/TSX support via Vite</li>
          <li>Style isolation with Shadow DOM</li>
          <li>Tailwind CSS 4 integration</li>
          <li>Async data fetching helpers</li>
        </ul>

        <div class="mt-8">
          <input
            type="text"
            class="border border-gray-300 rounded px-4 py-2 w-full max-w-md"
            value={message.value}
            onInput={(e) => {
              message.value = (e.target as HTMLInputElement).value;
            }}
            placeholder="Edit the welcome message..."
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Counter Page - Demonstrates signals and computed values
 */
function CounterPage() {
  const count = signal(0);
  const doubled = computed(() => count.value * 2);
  const tripled = computed(() => count.value * 3);

  // Example of an effect
  effect(() => {
    if (count.value > 10) {
      console.log("Count is greater than 10!", count.value);
    }
  });

  return (
    <div class="container mx-auto px-4">
      <h1 class="text-4xl font-bold mb-6">Counter Example</h1>

      <div class="space-y-6">
        <div class="bg-white shadow-lg rounded-lg p-6">
          <p class="text-2xl mb-4">
            Count: <span class="font-bold text-blue-600">{count}</span>
          </p>
          <p class="text-xl mb-4">
            Doubled: <span class="font-bold text-green-600">{doubled}</span>
          </p>
          <p class="text-xl mb-6">
            Tripled: <span class="font-bold text-purple-600">{tripled}</span>
          </p>

          <div class="flex gap-4">
            <button
              class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded"
              onClick={() => count.value++}
            >
              Increment
            </button>
            <button
              class="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded"
              onClick={() => count.value--}
            >
              Decrement
            </button>
            <button
              class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded"
              onClick={() => (count.value = 0)}
            >
              Reset
            </button>
          </div>
        </div>

        <div class="bg-blue-50 border border-blue-200 rounded p-4">
          <p class="text-sm text-gray-700">
            <strong>Note:</strong> This demonstrates reactive signals and
            computed values. Try incrementing past 10 to see an effect in the
            console!
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Mock user data for async example
 */
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

/**
 * Simulate API call
 */
async function fetchUser(userId: string): Promise<User> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simulate API response
  return {
    id: userId,
    name: `User ${userId}`,
    email: `user${userId}@example.com`,
    role: userId === "123" ? "Admin" : "User",
  };
}

/**
 * Async Data Page - Demonstrates asyncSignal
 */
function AsyncDataPage({ userId }: { userId: string }) {
  const user = asyncSignal(() => fetchUser(userId));

  return (
    <div class="container mx-auto px-4">
      <h1 class="text-4xl font-bold mb-6">Async Data Example</h1>

      <div class="bg-white shadow-lg rounded-lg p-6">
        <Show when={user.loading}>
          <div class="flex items-center justify-center py-12">
            <div class="text-xl text-gray-600">Loading user data...</div>
          </div>
        </Show>

        <Show when={user.error}>
          {(error) => (
            <div class="bg-red-50 border border-red-200 rounded p-4">
              <p class="text-red-700">
                <strong>Error:</strong> {error.message}
              </p>
            </div>
          )}
        </Show>

        <Show when={user.data}>
          {(userData) => (
            <div class="space-y-4">
              <h2 class="text-2xl font-bold">{userData.name}</h2>
              <div class="space-y-2">
                <p>
                  <strong>ID:</strong> {userData.id}
                </p>
                <p>
                  <strong>Email:</strong> {userData.email}
                </p>
                <p>
                  <strong>Role:</strong>{" "}
                  <span
                    class={
                      userData.role === "Admin"
                        ? "text-blue-600 font-semibold"
                        : "text-gray-600"
                    }
                  >
                    {userData.role}
                  </span>
                </p>
              </div>

              <button
                class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mt-4"
                onClick={() => user.refetch()}
              >
                Refetch Data
              </button>
            </div>
          )}
        </Show>
      </div>

      <div class="mt-6 bg-blue-50 border border-blue-200 rounded p-4">
        <p class="text-sm text-gray-700">
          <strong>Note:</strong> This demonstrates async data fetching with
          loading and error states. Try navigating to different user IDs in the
          URL (e.g., /async/456).
        </p>
      </div>
    </div>
  );
}

/**
 * Style Isolation Page - Demonstrates isolatedHTML
 */
function IsolatedPage() {
  // Example legacy HTML with conflicting styles
  // const legacyHTML = `
  //   <style>
  //     .container { background: yellow; padding: 20px; border: 3px solid red; }
  //     .title { color: red; font-size: 24px; font-weight: bold; }
  //     p { color: blue; }
  //   </style>
  //   <div class="container">
  //     <h2 class="title">This is Legacy HTML</h2>
  //     <p>These styles are isolated in Shadow DOM and won't affect the rest of the page.</p>
  //     <p>Notice the yellow background and red border - these styles only apply here!</p>
  //   </div>
  // `;

  const legacyHTML = html;

  return (
    <div class="container mx-auto px-4">
      <h1 class="text-4xl font-bold mb-6">Style Isolation Example</h1>

      <div class="space-y-8">
        <div class="bg-white shadow-lg rounded-lg p-6">
          <h2 class="text-2xl font-bold mb-4">Normal Content</h2>
          <div class="container bg-blue-50 p-4 rounded">
            <p class="text-gray-700">
              This is normal content with Tailwind classes. Notice it has a blue
              background.
            </p>
          </div>
          <iframe
            srcdoc={html}
            style={{
              width: "100%",
              height: "600px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
            sandbox="allow-scripts"
          />
        </div>

        <div class="bg-white shadow-lg rounded-lg p-6">
          <h2 class="text-2xl font-bold mb-4">Isolated Legacy HTML</h2>
          {isolatedHTML(legacyHTML)}
        </div>

        <div class="bg-white shadow-lg rounded-lg p-6">
          <h2 class="text-2xl font-bold mb-4">More Normal Content</h2>
          <div class="container bg-green-50 p-4 rounded">
            <p class="text-gray-700">
              This is more normal content. Even though the legacy HTML above has
              styles for .container and p tags, they don't affect this content
              thanks to Shadow DOM!
            </p>
          </div>
        </div>

        <div class="bg-blue-50 border border-blue-200 rounded p-4">
          <p class="text-sm text-gray-700">
            <strong>Note:</strong> The middle section uses Shadow DOM to isolate
            its styles. This is perfect for embedding legacy HTML or third-party
            widgets without style conflicts.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * About Page
 */
function AboutPage() {
  return (
    <div class="container mx-auto px-4">
      <h1 class="text-4xl font-bold mb-6">About SPA TS Engine</h1>

      <div class="prose max-w-none">
        <div class="bg-white shadow-lg rounded-lg p-6 space-y-4">
          <p class="text-lg">
            This is a minimal, single-file SPA framework built with TypeScript.
          </p>

          <h2 class="text-2xl font-bold mt-6 mb-3">Features</h2>
          <ul class="list-disc list-inside space-y-2 text-gray-700">
            <li>
              <strong>Signals:</strong> Reactive state management with automatic
              dependency tracking
            </li>
            <li>
              <strong>Computed Values:</strong> Derived state that auto-updates
            </li>
            <li>
              <strong>Effects:</strong> Side effects that run when dependencies
              change
            </li>
            <li>
              <strong>Async Signals:</strong> Built-in async data fetching with
              loading/error states
            </li>
            <li>
              <strong>Type-Safe Routing:</strong> Route parameters are fully
              typed
            </li>
            <li>
              <strong>JSX Support:</strong> Write components with familiar JSX
              syntax
            </li>
            <li>
              <strong>Style Isolation:</strong> Shadow DOM for embedding legacy
              HTML
            </li>
            <li>
              <strong>No Virtual DOM:</strong> Direct DOM manipulation for
              simplicity
            </li>
          </ul>

          <h2 class="text-2xl font-bold mt-6 mb-3">Philosophy</h2>
          <p class="text-gray-700">
            This framework prioritizes <strong>minimalism</strong> and{" "}
            <strong>simplicity</strong> over complex optimizations. The entire
            engine is contained in a single file (~1300 lines) and is designed
            for small to medium-sized applications where developer experience
            and code clarity matter most.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * 404 Not Found Page
 */
function NotFoundPage() {
  return (
    <div class="container mx-auto px-4 text-center">
      <h1 class="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <p class="text-2xl text-gray-600 mb-8">Page not found</p>
      <button
        class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded"
        onClick={() => router.navigate("/")}
      >
        Go Home
      </button>
    </div>
  );
}

// ============================================================================
// Main App Component
// ============================================================================

function App() {
  return (
    <div class="min-h-screen bg-gray-50">
      <Navigation />
      {match(router.current, {
        "/": () => <HomePage />,
        "/counter": () => <CounterPage />,
        "/async/:userId": ({ params }) => (
          <AsyncDataPage userId={params.userId!} />
        ),
        "/isolated": () => <IsolatedPage />,
        "/about": () => <AboutPage />,
        "*": () => <NotFoundPage />,
      })}
    </div>
  );
}

// ============================================================================
// Mount App
// ============================================================================

const root = document.getElementById("app");
if (root) {
  root.appendChild(<App />);
} else {
  console.error("Root element not found");
}
