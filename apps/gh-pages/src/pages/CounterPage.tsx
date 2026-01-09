import { signal, computed, effect } from "@repo/einblatt";

export function CounterPage() {
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
