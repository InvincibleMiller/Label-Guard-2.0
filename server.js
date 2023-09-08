const express = require("express");
const next = require("next");

const port = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== "production";

// creating the app either in production or dev mode
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

// running the app, async operation
nextApp.prepare().then(() => {
  const app = express();

  // this is a test API route
  app.get("/api/test", (req, res) => {
    res.json({ message: "This is a test API route" });
  });

  // redirecting all requests to Next.js
  app.all("*", (req, res) => {
    return handle(req, res);
  });

  app.listen(port, (err) => {
    if (err) throw err;
    console.log(`Runing on http://localhost:${port}/, dev: ${dev}`);
  });
});
