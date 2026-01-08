import * as net from "net";

const server = net.createServer();

server.on("connection", (socket) => {
  socket.on("data", (data) => {
    console.log("Received data", data.toString());
    socket.write(`Echo:\n${data.toString()}`);
  });
  socket.on("error", (error) => {
    console.error("Socket Error", error);
  });
  socket.on("close", () => {
    console.log("Socket closed");
  });
});

server.listen(8080, () => {
  console.log("Server started");
});
