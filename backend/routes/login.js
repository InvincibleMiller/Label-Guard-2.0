const { default: next } = require("next");
const { loginAdmin } = require("../fauna/queries");
const { redirect } = require("next/dist/server/api-utils");

const login = {
  post: async (req, res) => {
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

      const login_result = await loginAdmin(email, password);

      if (typeof login_result === "number") {
        res.status(login_result).json({
          status: login_result,
          message: "Invalid email or password!",
        });
        return;
      }

      res.cookie(process.env.TOKEN_COOKIE, login_result.data.secret, {
        httpOnly: true, // Cookie is only accessible via HTTP
        secure: true, // Requires HTTPS to send the cookie
        sameSite: "Lax", // Protects against CSRF attacks
        signed: true, // Signs the cookie with a secret key
      });

      res.redirect("/");
      return;
    } catch (error) {
      console.error(error);
      next(error);
    }
  },
};

module.exports = login;
