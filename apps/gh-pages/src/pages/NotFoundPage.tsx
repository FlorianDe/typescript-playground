import type { Router } from "@repo/einblatt";

export function NotFoundPage({ router }: { router: Router }) {
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
