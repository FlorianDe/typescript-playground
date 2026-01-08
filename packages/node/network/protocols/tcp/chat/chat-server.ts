import * as net from "net";
import * as path from "path";
import * as fs from "fs";

type UniqueChannelName = string;
type UniqueUserName = string;
type Channel = {
  name: UniqueChannelName;
  secret?: string;
  creator: UniqueUserName;
};
type User = {
  name: UniqueUserName;
  secret: string;
  channels: UniqueChannelName[];
};

interface PkResolver<EntityType> {
  getPk(entity: EntityType): string;
}

class Storage<EntityType> {
  private entityMap: Map<string, EntityType>;
  private rootStorageDir: string;

  constructor(
    storagePath: string,
    private pkResolver: PkResolver<EntityType>,
  ) {
    this.entityMap = new Map();
    this.rootStorageDir = path.resolve(__dirname, "tmp-files", storagePath);
    this.ensureRootDir();
    this.loadAll();
  }

  private ensureRootDir(): void {
    if (!fs.existsSync(this.rootStorageDir)) {
      fs.mkdirSync(this.rootStorageDir, { recursive: true });
    }
  }

  private loadFromFile(filePath: string): EntityType | undefined {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath).toString()) as EntityType;
    }
    return undefined;
  }

  private getFilePath(pk: string): string {
    return path.join(this.rootStorageDir, `${pk}.json`);
  }

  private loadAll(): void {
    console.log("Loading all entities from", this.rootStorageDir);
    const files = fs.readdirSync(this.rootStorageDir);
    for (const filename of files) {
      const entity = this.loadFromFile(path.join(this.rootStorageDir, filename));
      if (entity) {
        console.log("Loaded entity", entity);
        this.entityMap.set(this.pkResolver.getPk(entity), entity);
      }
    }
  }

  public get(pk: string): EntityType | undefined {
    if (!this.entityMap.has(pk)) {
      return this.load(pk);
    }
    return this.entityMap.get(pk);
  }

  public load(pk: string): EntityType | undefined {
    if (this.exists(pk)) {
      const entity = this.loadFromFile(this.getFilePath(pk))!;
      if (entity) {
        this.entityMap.set(this.pkResolver.getPk(entity), entity);
      }
    }
    return undefined;
  }

  public store(entity: EntityType): void {
    const pk = this.pkResolver.getPk(entity);
    this.entityMap.set(pk, entity);
    fs.writeFileSync(this.getFilePath(pk), JSON.stringify(entity));
  }

  public exists(pk: string): boolean {
    if (this.entityMap.has(pk)) {
      return true;
    }
    return fs.existsSync(this.getFilePath(pk));
  }
}

const channelStorage = new Storage<Channel>("channels", {
  getPk: (channel) => channel.name,
});
const userStorage = new Storage<User>("users", {
  getPk: (user) => user.name,
});

type Packet =
  | { command: "register"; payload: { username: string; secret: string } }
  | { command: "login"; payload: { username: string; secret: string } }
  | { command: "create-channel"; payload: { name: string; secret?: string } }
  | { command: "join-channel"; payload: { name: string; secret?: string } }
  | { command: "leave-channel" }
  | { command: "send-message"; payload: { message: string } }
  | { command: "list-channels" };

const packetRegex = /^\\(\w+-?\w+) ?(.*)/;
const parseTcpPacket = (packetString: string): Packet | undefined => {
  const getCommandAndPayload = (packet: string) => {
    const match = packetRegex.exec(packet.trim());
    if (match) {
      return { command: match[1], payload: match[2] };
    }
    return undefined;
  };

  const packet = getCommandAndPayload(packetString);
  console.log(`received cmd ${packet?.command}`);
  if (!packet) {
    return undefined;
  }
  switch (packet.command) {
    case "register": {
      const [username, secret] = packet.payload.trim().split(" ", 2);
      return { command: "register", payload: { username, secret } };
    }
    case "login": {
      const [username, secret] = packet.payload.trim().split(" ", 2);
      return { command: "login", payload: { username, secret } };
    }
    case "create-channel": {
      const [name, secret] = packet.payload.trim().split(" ");
      return { command: "create-channel", payload: { name, secret } };
    }
    case "join-channel": {
      const [name, secret] = packet.payload.trim().split(" ");
      return { command: "join-channel", payload: { name, secret } };
    }
    case "leave-channel": {
      return { command: "leave-channel" };
    }
    case "send-message": {
      const [message] = packet.payload.trim().split(" ");
      return { command: "send-message", payload: { message } };
    }
    case "list-channels": {
      return { command: "list-channels" };
    }
    default:
      return undefined;
  }
};

type Mode = "logged_out" | "logged_in" | "in_channel";

const connections: Record<
  string,
  {
    user: User | undefined;
    mode: Mode;
    currentChannel: Channel | undefined;
  }
> = {};

const server = net.createServer((socket) => {
  const socketId = `${socket.remoteAddress}:${socket.remotePort}`;
  connections[socketId] = {
    user: undefined,
    mode: "logged_out",
    currentChannel: undefined,
  };

  console.log("Client connected", socketId);
  socket.on("data", (data) => {
    console.log("Received data", data.toString());

    const packet = parseTcpPacket(data.toString());
    console.log("Parsed packet", packet);
    if (packet) {
      if (connections[socketId].mode === "logged_out") {
        switch (packet.command) {
          case "register": {
            const username = packet.payload.username;
            if (userStorage.exists(username)) {
              socket.write(`User ${username} already exists!\n`);
            }
            const user = {
              name: username,
              secret: packet.payload.secret,
              channels: [],
            };
            connections[socketId].user = user;
            userStorage.store(user);
            break;
          }
          case "login": {
            const user = userStorage.get(packet.payload.username);
            if (user && user.secret === packet.payload.secret) {
              connections[socketId].user = user;
              connections[socketId].mode = "logged_in";
              socket.write(`Welcome ${user.name}!\n`);
            } else {
              socket.write(`Login failed!\n`);
            }
            break;
          }
        }
      } else if (connections[socketId].mode === "logged_in" && connections[socketId].user) {
        switch (packet.command) {
          case "create-channel": {
            const channelName = packet.payload.name;
            if (channelStorage.exists(channelName)) {
              console.log("Channel already exists");
              socket.write(`Channel ${channelName} already exists!\n`);
            } else {
              //TODO
              // const channel: Channel = {
              // 	name: channelName,
              // 	secret: packet.payload.secret,
              // 	creator: connections[socketId].user.name,
              // }
              // channelStorage.store(channel);
              // user.channels.push(channelName);
              // userStorage.store(user);
              console.log("Channel created");
              socket.write(`Channel ${channelName} created!\n`);
            }
            break;
          }
          case "join-channel": {
            const channelNameToJoin = packet.payload.name;
            const channel = channelStorage.get(channelNameToJoin);
            if (channel) {
              if (channel.secret === packet.payload.secret) {
                socket.write(`Joined channel ${channelNameToJoin}!`);
                connections[socketId].mode = "in_channel";
                connections[socketId].currentChannel = channel;
              } else {
                socket.write(`Wrong secret for channel ${channelNameToJoin}!`);
              }
            }
            break;
          }
          case "list-channels": {
            socket.write(`Channels: ${connections[socketId]?.user?.channels?.join(", ")}`);
            break;
          }
        }
      } else if (
        connections[socketId].mode === "in_channel" &&
        connections[socketId].user &&
        connections[socketId].currentChannel
      ) {
        switch (packet.command) {
          case "send-message": {
            const message = packet.payload.message;
            //TODO
            break;
          }
          case "leave-channel": {
            const channelName = connections[socketId]?.currentChannel?.name;
            connections[socketId].mode = "logged_in";
            connections[socketId].currentChannel = undefined;
            socket.write(`Left channel ${channelName}!`);
            break;
          }
        }
      } else {
        socket.write(`Unknown command!`);
      }
    }

    socket.on("error", (error) => {
      console.error("Socket Error", error);
    });
    socket.on("close", () => {
      console.log(`Socket ${socketId} while in mode ${connections[socketId].mode} closed`);
    });
  });
});

server.listen(42, () => {
  console.log("Chat Server started");
});
