const {
  loginAdmin,
  userHasNoLocations,
  getDefaultLocation,
  locationBelongsToUser,
} = require("../fauna/queries");

const login = {
  post: async (req, res, next) => {
    const errorMessage = { message: "Invalid email or password!" };

    try {
      // Log the user in and store the session token
      const { email, password } = req.body;

      // confirm that the email is valid
      // RFC5322
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

      const isValidEmail = emailRegex.test(email);
      if (!isValidEmail) {
        res.status(422).json({
          status: 422,
          message: "Invalid email provided!",
        });
        return;
      }

      // try logging in the user
      const { data: login_result } = await loginAdmin(email, password);

      if (typeof login_result === "number") {
        res.status(login_result).json({
          status: login_result,
          message: "Invalid email or password!",
        });
        return;
      }

      // set this cookie for login persistence
      res.cookie(process.env.TOKEN_COOKIE, login_result.secret, {
        httpOnly: true, // Cookie is only accessible via HTTP
        secure: true, // Requires HTTPS to send the cookie
        sameSite: "Lax", // Protects against CSRF attacks
        signed: true, // Signs the cookie with a secret key
      });

      const { data: hasNoLocations } = await userHasNoLocations(
        login_result.document.id
      );

      if (hasNoLocations) {
        // go to the location registry if the user hasn't subscribed
        // to the service
        res.redirect("/auth/register-location");
        return;
      }

      // Make sure there is a location saved in this cooke
      // before going to the dashboard and make sure it belongs
      // to the user before allowing them to see it
      const locationId = req.cookies[process.env.LOCATION_ID_COOKIE];
      const { data: userOwnsLocation } = await locationBelongsToUser(
        login_result.document.id,
        locationId
      );

      if (locationId == undefined || !userOwnsLocation) {
        // The user doesn't own the location or there isn't one saved
        // so pull one of their locations
        const { data: locationDoc } = await getDefaultLocation(
          login_result.document.id
        );
        res.cookie(process.env.LOCATION_ID_COOKIE, locationDoc.id);
      }

      // go to the dash
      res.redirect("/auth/dashboard");
      return;
    } catch (error) {
      console.error(error);
      const { httpStatus } = error;
      if (httpStatus !== undefined) {
        res.status(httpStatus).json(errorMessage);
      }

      res.status(400).json(errorMessage);
    }
  },
};

module.exports = login;
