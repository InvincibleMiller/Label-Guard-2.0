const express = require("express");
const next = require("next");

const port = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== "production";

// creating the app either in production or dev mode
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

// import all express api routes here
const test = require("./backend/routes/test");

// running the app, async operation
nextApp.prepare().then(() => {
  const app = express();

  // this is a test API route
  app.get("/api/test", test.get);

  // redirecting all requests to Next.js
  app.all("*", (req, res) => {
    return handle(req, res);
  });

  app.listen(port, (err) => {
    if (err) throw err;
    console.log(`Runing on http://localhost:${port}/, dev: ${dev}`);
  });
});
