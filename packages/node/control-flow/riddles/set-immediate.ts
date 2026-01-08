import * as assert from "assert";

const result: string[] = [];
const appendRes = (value: string) => result.push(value);

const baz = () => appendRes("baz");
const foo = () => appendRes("foo");
const zoo = () => appendRes("zoo");
const start = () => {
  appendRes("start");
  setImmediate(baz);
  new Promise<string>((resolve) => {
    resolve("bar");
  }).then((resolve) => {
    appendRes(resolve);
    process.nextTick(zoo);
  });
  process.nextTick(foo);
};
start();
setTimeout(() => {
  console.log("result", result);
  assert(result.length === 5);
  assert(result[0] === "start");
  assert(result[1] === "foo");
  assert(result[2] === "bar");
  assert(result[3] === "zoo");
  assert(result[4] === "baz");
  console.log("passed");
}, 10);
