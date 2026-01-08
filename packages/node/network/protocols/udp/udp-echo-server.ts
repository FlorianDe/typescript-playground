import * as udp from "dgram";

const server = udp.createSocket("udp4");

server.on("listening", () => {
  console.log(`Server is listening on ${JSON.stringify(server.address())}`);
});

server.on("message", (message, info) => {
  const msg = message.toString();
  console.log("Received message", msg);
  const response = Buffer.from("Echo: " + msg + "\n");
  server.send(response, info.port, info.address, (err) => {
    if (err) {
      console.error("Error sending message", err);
    }
  });
});

server.bind(5555);
