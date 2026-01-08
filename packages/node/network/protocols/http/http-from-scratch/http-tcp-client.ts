import * as http from "http";
import { RequestOptions } from "http";

const options: RequestOptions = {
  hostname: "localhost",
  port: 80,
  method: "POST",
  path: `/user/:userId?filter=12&date=${Date.now()}`,
  headers: {
    "Content-Type": "text/plain",
  },
};
console.log("Constructing request");
const req = http.request(options, (res) => {
  const body: Array<Uint8Array> = [];
  res
    .on("data", (chunk) => {
      console.log("Received chunk", Buffer.concat([chunk]).toString());
      body.push(chunk);
    })
    .on("end", () => {
      const resp = Buffer.concat(body).toString();
      console.log(`==== ${res.statusCode} ${res.statusMessage}`);
      console.log("> Headers from server");
      console.log(res.headers);

      console.log("> Body from server");
      console.log(resp);
    })
    .on("error", (error) => {
      console.error("Server Error", error);
    });
});
req.once("response", (res) => {
  const ip = req?.socket?.localAddress;
  const port = req?.socket?.localPort;
  console.log(`Your IP address is ${ip} and your source port is ${port}.`);
});
req.write("Moin1\n");
req.end("Moin2");
console.log("Sent request");
