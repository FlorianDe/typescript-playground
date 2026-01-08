/**
 * - Reads log entries from a simulated stream.
 * - Transforms them to uppercase immutably.
 * - Writes them to a simulated WritableStream (e.g., file or console).
 */

function createLogStream(): ReadableStream<string> {
  const logEntries = [
    "2024-06-01 12:00:01 INFO User logged in.",
    "2024-06-01 12:00:05 WARN Invalid password attempt.",
    "2024-06-01 12:00:10 ERROR Server unreachable.",
    "2024-06-01 12:00:15 INFO User logged out.",
  ];

  return new ReadableStream<string>({
    start(controller) {
      for (const entry of logEntries) {
        controller.enqueue(entry); // Push log entry to stream
      }
      controller.close(); // Signal end of stream
    },
  });
}

function createWritableStream(): WritableStream<string> {
  return new WritableStream<string>({
    write(chunk) {
      console.log(`[WRITTEN]: ${chunk}`);
    },
    close() {
      console.log("WritableStream closed.");
    },
    abort(reason) {
      console.error(`WritableStream aborted: ${reason}`);
    },
  });
}

function createUppercaseTransformStream(): TransformStream<string, string> {
  return new TransformStream<string, string>({
    async transform(chunk, controller) {
      controller.enqueue(chunk.toUpperCase());
    },
  });
}

async function main() {
  const logStream = createLogStream();
  const uppercaseTransform = createUppercaseTransformStream();
  const writableStream = createWritableStream();

  console.log("Starting data streaming...");

  await logStream.pipeThrough(uppercaseTransform).pipeTo(writableStream);

  console.log("Data streaming complete.");
}
main().catch((error) => console.error(`Error: ${error.message}`));
