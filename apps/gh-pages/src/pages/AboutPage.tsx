export function AboutPage() {
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
