require("dotenv-flow").config();
const express = require("express");
const http = require("http");
const next = require("next");
const WebSocket = require("ws");

// express middleware functions
const { checkLogin } = require("./backend/middleware/checkLogin");

// express api functions
const register = require("./backend/routes/register");
const login = require("./backend/routes/login");
const { loginToForm } = require("./backend/routes/form/loginForm");

// "auth" api functions
const logout = require("./backend/routes/auth/logout");
const registerLocation = require("./backend/routes/auth/registerLocation");
const checkout = require("./backend/routes/auth/checkout");
const verifySubscription = require("./backend/routes/auth/verifySubscription");
const { getForms, registerForm } = require("./backend/routes/auth/forms");
const { getLocationData } = require("./backend/routes/form/getLocationData");
const { getShifts, registerShift } = require("./backend/routes/auth/shifts");
const {
  getInventory,
  registerProduct,
} = require("./backend/routes/auth/inventory");
const {
  getViolations,
  registerViolation,
} = require("./backend/routes/auth/violations");
const {
  getDocument,
  deleteDocument,
  updateFormDocument,
  updateShiftDocument,
  updateProductDocument,
  updateViolationDocument,
} = require("./backend/routes/auth/document");
const {
  getFindingPage,
  getNextPage,
} = require("./backend/routes/auth/getFindingPage");

const {
  deleteFindingReport,
  getFindingReportDocument,
  editFindingReport,
} = require("./backend/routes/auth/findingReport");

const getAllLocations = require("./backend/routes/auth/getAllLocations.js");

const submitFindingReport = require("./backend/routes/form/submitFindingReport");

const compileReport = require("./backend/routes/auth/compileReport");

// express parsers
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

//
// # Setup the server
//

const port = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== "production";

// creating the app either in production or dev mode
const app = next({ dev });
const handle = app.getRequestHandler();

// running the app, async operation
app.prepare().then(() => {
  const server = express();
  // Web socket server
  // TODO - use web sockets to update the client's form whenever \
  // a location changes its inventory violations of products
  const httpServer = http.createServer(server);
  const wss = new WebSocket.Server({ server: httpServer });

  // WebSocket connection handling
  wss.on("connection", (ws) => {
    console.log("New WebSocket connection established.");

    // Handle incoming messages
    ws.on("message", (message) => {
      console.log("Received:", message);
    });

    // Send a welcome message to the client
    ws.send("Welcome to the WebSocket server!");

    // Handle the WebSocket connection closing
    ws.on("close", () => {
      console.log("WebSocket connection closed.");
    });
  });

  // parsing middleware
  server.use(bodyParser.json());
  server.use(bodyParser.urlencoded({ extended: true }));
  server.use(cookieParser(process.env.COOKIE_PARSER_SECRET));

  // useful middleware during development
  if (dev) {
    server.use("/api/", (req, res, next) => {
      console.log(`${Date.now()} — ${req.method} @/api${req.url}`);

      return next();
    });
  }

  // register new user api route
  server.post("/api/register", register.post, login.post);

  // login existing user
  server.post("/api/login", login.post);

  //
  // # Form API Routes
  //

  // login to a form
  server.post("/api/form/login", loginToForm);

  // get the location data for use in the form
  server.get("/api/form/get-location-data", getLocationData);

  // submit a finding report
  server.post("/api/form/submit-finding-report", submitFindingReport);

  //
  // # API Routes that requires users to be logged
  //

  server.use("/api/auth", checkLogin());
  // logout api route
  server.post("/api/auth/logout", logout.post);
  // register location api route and redirect to checkout
  server.post(
    "/api/auth/register-location",
    registerLocation.post,
    checkout.post
  );
  // checkout session api route
  server.post("/api/auth/checkout", checkout.post);
  // verify customer subscription
  server.get("/api/auth/verify-subscription", verifySubscription.get);
  // register a new form for the location
  server.post("/api/auth/register-form", registerForm);
  // register new shift for the location
  server.post("/api/auth/register-shift", registerShift);
  // register a new product for the location
  server.post("/api/auth/register-product", registerProduct);
  // register a new violation for the location
  server.post("/api/auth/register-violation", registerViolation);
  // get forms for location
  server.get("/api/auth/get-forms", getForms);
  // get shifts for location
  server.get("/api/auth/get-shifts", getShifts);
  // get inventory for location
  server.get("/api/auth/get-inventory", getInventory);
  // get inventory for violation
  server.get("/api/auth/get-violations", getViolations);
  // get document route
  server.get("/api/auth/edit/:documentID/:documentCollection", getDocument);
  // route to delete documents owned by the location
  server.post("/api/auth/delete-document", deleteDocument);
  // route to update form documents owned by a location
  server.post("/api/auth/update-form", updateFormDocument);
  // route to update shift documents owned by a location
  server.post("/api/auth/update-shift", updateShiftDocument);
  // route to update product documents owned by a location
  server.post("/api/auth/update-product", updateProductDocument);
  // route to update violation documents owned by a location
  server.post("/api/auth/update-violation", updateViolationDocument);

  // route to get the finding reports as a page
  server.get("/api/auth/get-finding-page", getFindingPage);
  // route to get the next page of finding reports
  server.get("/api/auth/get-next-page", getNextPage);

  // route to delete finding-report documents
  server.post("/api/auth/delete-finding-report", deleteFindingReport);

  // route to get all the violation pair from a finding report
  server.get("/api/auth/get-finding-report", getFindingReportDocument);

  // route to update the finding document
  server.post("/api/auth/update-finding-report", editFindingReport);

  // get the compiled report
  server.get("/api/auth/get-full-report", compileReport);

  // get all the locations for the user location selector
  server.get("/api/auth/get-all-locations", getAllLocations);

  server.post("/api/auth/change-location", (req, res, next) => {
    try {
      const { locationID } = req.body;

      if (locationID === undefined) {
        res.status(422);
        throw new Error("locationID expected in request");
      }

      res.cookie(process.env.LOCATION_ID_COOKIE, locationID);

      res.redirect("/auth/dashboard");
    } catch (error) {
      console.error(error);
      next(error);
    }
  });

  // redirecting all requests to Next.js
  server.use("/auth/", checkLogin("/login"));
  server.all("*", (req, res) => {
    return handle(req, res);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`\n# Running on http://localhost:${port}/, dev: ${dev}`);
  });
});
