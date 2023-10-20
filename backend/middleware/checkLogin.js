// This middleware function is going to ensure that the user is logged in
// before allowing any server requests to access API endpoints that require
// user authentication
const { getFaunaClient } = require("../fauna/client");
const { getUserDoc, locationBelongsToUser } = require("../fauna/queries");

// get the redirect path and return a function that
// will redirect you to the path you request if the user isn't logged in
const checkLogin = (redirectPath) => async (req, res, next) => {
  try {
    // Get the login token
    const userToken = req.signedCookies[process.env.TOKEN_COOKIE];

    // Make sure that the user is actually logged in
    if (!userToken) {
      let message = "User not logged in!";

      if (redirectPath) {
        res.redirect(redirectPath);
      } else {
        res.status(403).json(message);
      }

      return;
    }

    // store the client and user document in the request object
    req.faunaClient = getFaunaClient(userToken);
    req.userDocument = await getUserDoc(req.faunaClient);

    // validate that the user owns the location
    // if it's included in the query

    const locationID = req.cookies[process.env.LOCATION_ID_COOKIE];

    if (locationID !== undefined) {
      // Validate that the user owns the location for which they are querying data
      const { data: userOwnsLocation } = await locationBelongsToUser(
        req.userDocument.id,
        locationID
      );

      if (!userOwnsLocation) {
        res.status(403).json({
          message:
            "Client must own the location for which they are performing requests",
        });
      }
    }

    next();
    return;
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = { checkLogin };
