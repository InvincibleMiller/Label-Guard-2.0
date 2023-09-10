const { registerAdmin } = require("../fauna/queries");

const register = {
  post: async (req, res, next) => {
    // Perform user input validation
    const {
      "first-name": firstName,
      "last-name": lastName,
      email,
      password,
      confirm,
    } = req.body;

    // ensure that the user has input their name
    if (firstName === "" || lastName === "" || !firstName || !lastName) {
      res.status(422).json({ status: 422, message: "Name cannot be blank!" });
      return;
    }

    // password must be at least 8 characters long
    if (password.length < 8) {
      res.status(422).json({
        status: 422,
        message: "Password must be at least 8 characters!",
      });
      return;
    }

    // make sure that the passwords match
    if (password !== confirm) {
      res.status(422).json({
        status: 422,
        message: "Passwords don't match!",
      });
      return;
    }

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

    //
    // # Now that we have passed user input validation
    // # lets start the Fauna DB side of things
    //

    try {
      const register_result = await registerAdmin(
        email,
        password,
        firstName,
        lastName
      );

      // Check for Errors
      if (typeof register_result === "number") {
        // do something
        res.status(403).json({
          status: 403,
          message: "That email has already been registered!",
        });
        return;
      }

      // continue to login
      next();
      return;
    } catch (error) {
      console.error(error);
      next(error);
    }
  },
};

module.exports = register;
