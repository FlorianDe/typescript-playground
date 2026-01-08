import * as http from "node:http";

const auth = (req: http.IncomingMessage, res: http.ServerResponse<http.IncomingMessage>): boolean => {
  const authHeader = req.headers.authorization;
  console.log(req.headers);

  const challengeBasic = () => {
    res.setHeader("WWW-Authenticate", 'Basic realm="Secure Area"');
    res.writeHead(401);
    res.end();
  };
  if (!authHeader) {
    challengeBasic();
    return false;
  }
  const auth = authHeader.split(" ")[1];
  const [username, password] = Buffer.from(auth, "base64").toString().split(":");
  if (username === "admin" && password === "password") {
    return true;
  }
  challengeBasic();
  return false;
};

http
  .createServer((request, response) => {
    request.on("error", (err) => {
      console.error(err);
      response.statusCode = 400;
      response.end();
    });
    response.on("error", (err) => {
      console.error(err);
    });
    if (auth(request, response)) {
      request.pipe(response);
    }
  })
  .listen(80);
