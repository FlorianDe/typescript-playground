import { EventEmitter } from "node:events";

const emitter = new EventEmitter();
emitter.once("event", () => {
  console.log("Preparing stuff on the first receive");
  emitter.on("event", () => {
    console.log("Next event occurred");
  });
});

emitter.emit("event");
emitter.emit("event");
