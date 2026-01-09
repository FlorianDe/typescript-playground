import { signal } from "@repo/einblatt";

export function HomePage() {
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
