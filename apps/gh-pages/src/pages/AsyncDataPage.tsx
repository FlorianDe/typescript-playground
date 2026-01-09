import { signal, asyncSignal, Show, type Router } from "@repo/einblatt";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

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

interface AsyncDataPageProps {
  userId?: string;
  router: Router;
}

export function AsyncDataPage({ userId, router }: AsyncDataPageProps) {
  // If no userId, show the search form
  if (!userId) {
    const inputId = signal("");

    const handleSubmit = (e: Event) => {
      e.preventDefault();
      if (inputId.value.trim()) {
        router.navigate(`/async/${inputId.value.trim()}`);
      }
    };

    return (
      <div class="container mx-auto px-4">
        <h1 class="text-4xl font-bold mb-6">Async Data Example</h1>

        <div class="bg-white shadow-lg rounded-lg p-6">
          <p class="text-gray-700 mb-4">
            Enter a user ID to load their data:
          </p>
          <form class="flex gap-4" onSubmit={handleSubmit}>
            <input
              type="text"
              class="border border-gray-300 rounded px-4 py-2 flex-1 max-w-xs"
              placeholder="Enter user ID (e.g., 123)"
              value={inputId.value}
              onInput={(e) => {
                inputId.value = (e.target as HTMLInputElement).value;
              }}
            />
            <button
              type="submit"
              class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded"
            >
              Load User
            </button>
          </form>
        </div>

        <div class="mt-6 bg-blue-50 border border-blue-200 rounded p-4">
          <p class="text-sm text-gray-700">
            <strong>Note:</strong> This demonstrates async data fetching with
            loading and error states. Try entering different user IDs - user
            "123" is an Admin.
          </p>
        </div>
      </div>
    );
  }

  // If userId is provided, show the user data
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

              <div class="flex gap-4 mt-4">
                <button
                  class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                  onClick={() => user.refetch()}
                >
                  Refetch
                </button>
                <button
                  class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                  onClick={() => router.navigate("/async")}
                >
                  Load Different User
                </button>
              </div>
            </div>
          )}
        </Show>
      </div>
    </div>
  );
}
