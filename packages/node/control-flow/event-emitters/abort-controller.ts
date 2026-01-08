import { on, EventEmitter } from "node:events";
import * as process from "node:process";

//Node version has to be greater or equal to 15.4.0 to use the AbortController in nodejs
const ac = new AbortController();

ac.signal.addEventListener("abort", () => {
  console.log("Aborted received");
});

const run = async () => {
  const emitter = new EventEmitter();
  process.nextTick(() => {
    emitter.emit("event", "first");
    emitter.emit("event", "second");
  });

  for await (const event of on(emitter, "event", { signal: ac.signal })) {
    console.log(event);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
};

run()
  .then(() => console.log("Done"))
  .catch((err: Error) => console.error(`Error while running: ${err.name} - ${err.message}`));

process.nextTick(() => {
  ac.abort("Just for fun");
});
