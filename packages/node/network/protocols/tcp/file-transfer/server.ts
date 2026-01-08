import net from "net";

const { PORT = 8080 } = process.env;

const server = net.createServer();

server.on("connection", (socket) => {
  console.log("Client connected", JSON.stringify(socket, null, "\t"));
  console.log("Client connected", socket.remoteAddress, socket.remotePort);

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

server.listen(PORT, () => {
  console.log("Server started on port", PORT);
});
