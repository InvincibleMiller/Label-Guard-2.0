// This middleware function is going to ensure that the user is logged in
// before allowing any server requests to access API endpoints that require
// user authentication
const { getFaunaClient } = require("../fauna/client");
const { getUserId } = require("../fauna/queries");

// get the redirect path and return a function that
// will redirect you to the path you request if the user isn't logged in
const checkLogin = (redirectPath) => async (req, res, next) => {
  // Get the login token
  const userToken = req.signedCookies[process.env.TOKEN_COOKIE];

  // Make sure that the user is actually logged in
  if (!userToken) {
    let message = "User not logged in!";

    if (redirectPath) {
      res.redirect(redirectPath);
    } else {
      res.status(403).send(message);
    }

    return;
  }

  // store the client and user document in the request object
  req.faunaClient = getFaunaClient(userToken);
  req.userDocument = await getUserId(req.faunaClient);

  next();
  return;
};

module.exports = { checkLogin };
