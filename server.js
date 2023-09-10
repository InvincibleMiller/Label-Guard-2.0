require("dotenv-flow").config();
const express = require("express");
const next = require("next");

// express parsers
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const port = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== "production";

// creating the app either in production or dev mode
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

// express middleware functions
const { checkLogin } = require("./backend/middleware/checkLogin");

// express api functions
const register = require("./backend/routes/register");
const login = require("./backend/routes/login");
const logout = require("./backend/routes/auth/logout");

// "auth" api functions
const registerLocation = require("./backend/routes/auth/registerLocation");

// running the app, async operation
nextApp.prepare().then(() => {
  const app = express();

  // parsing middleware
  app.use(bodyParser.json());
  app.use(cookieParser(process.env.COOKIE_PARSER_SECRET));

  // useful middleware during development
  if (dev) {
    app.use("/api/", (req, res, next) => {
      console.log(`${Date.now()} — HIT @/api${req.url}`);

      return next();
    });
  }

  // register new user api route
  app.post("/api/register", register.post, login.post);

  // login existing user
  app.post("/api/login", login.post);

  // API Routes that requires users to be logged
  app.use("/api/auth", checkLogin());
  // logout api route
  app.post("/api/auth/logout", logout.post);
  // register location api route
  app.post("/api/auth/register-location", registerLocation.post);

  // redirecting all requests to Next.js
  app.use("/auth/", checkLogin("/login"));
  app.all("*", (req, res) => {
    return handle(req, res);
  });

  app.listen(port, (err) => {
    if (err) throw err;
    console.log(`\n# Running on http://localhost:${port}/, dev: ${dev}`);
  });
});
