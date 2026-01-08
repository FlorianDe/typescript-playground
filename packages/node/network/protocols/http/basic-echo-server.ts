import * as http from "http";

// https://nodejs.org/en/docs/guides/anatomy-of-an-http-transaction
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
    request.pipe(response);
  })
  .listen(8080);
