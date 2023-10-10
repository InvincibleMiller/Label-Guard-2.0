require("dotenv-flow").config();
const express = require("express");
const next = require("next");

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

const submitFindingReport = require("./backend/routes/form/submitFindingReport");

// express parsers
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

//
// # Setup the server
//

const port = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== "production";

// creating the app either in production or dev mode
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

// running the app, async operation
nextApp.prepare().then(() => {
  const app = express();

  // parsing middleware
  app.use(bodyParser.json());
  app.use(cookieParser(process.env.COOKIE_PARSER_SECRET));

  // useful middleware during development
  if (dev) {
    app.use("/api/", (req, res, next) => {
      console.log(`${Date.now()} — ${req.method} @/api${req.url}`);

      return next();
    });
  }

  // register new user api route
  app.post("/api/register", register.post, login.post);

  // login existing user
  app.post("/api/login", login.post);

  //
  // # Form API Routes
  //

  // login to a form
  app.post("/api/form/login", loginToForm);

  // get the location data for use in the form
  app.get("/api/form/get-location-data", getLocationData);

  // submit a finding report
  app.post("/api/form/submit-finding-report", submitFindingReport);

  //
  // # API Routes that requires users to be logged
  //

  app.use("/api/auth", checkLogin());
  // logout api route
  app.post("/api/auth/logout", logout.post);
  // register location api route and redirect to checkout
  app.post("/api/auth/register-location", registerLocation.post, checkout.post);
  // checkout session api route
  app.post("/api/auth/checkout", checkout.post);
  // verify customer subscription
  app.get("/api/auth/verify-subscription", verifySubscription.get);
  // register a new form for the location
  app.post("/api/auth/register-form", registerForm);
  // register new shift for the location
  app.post("/api/auth/register-shift", registerShift);
  // register a new product for the location
  app.post("/api/auth/register-product", registerProduct);
  // register a new violation for the location
  app.post("/api/auth/register-violation", registerViolation);
  // get forms for location
  app.get("/api/auth/get-forms", getForms);
  // get shifts for location
  app.get("/api/auth/get-shifts", getShifts);
  // get inventory for location
  app.get("/api/auth/get-inventory", getInventory);
  // get inventory for violation
  app.get("/api/auth/get-violations", getViolations);
  // get document route
  app.get("/api/auth/edit/:documentID/:documentCollection", getDocument);
  // route to delete documents owned by the location
  app.post("/api/auth/delete-document", deleteDocument);
  // route to update form documents owned by a location
  app.post("/api/auth/update-form", updateFormDocument);
  // route to update shift documents owned by a location
  app.post("/api/auth/update-shift", updateShiftDocument);
  // route to update product documents owned by a location
  app.post("/api/auth/update-product", updateProductDocument);
  // route to update violation documents owned by a location
  app.post("/api/auth/update-violation", updateViolationDocument);

  // route to get the finding reports as a page
  app.get("/api/auth/get-finding-page", getFindingPage);
  // route to get the next page of finding reports
  app.get("/api/auth/get-next-page", getNextPage);

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
