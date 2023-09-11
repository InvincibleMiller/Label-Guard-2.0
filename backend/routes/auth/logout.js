const { fql } = require("fauna");
const { logout: faunaLogout } = require("../../fauna/queries");

const logout = {
  post: async (req, res, next) => {
    try {
      // delete the token on Fauna DB
      const faunaLogout_result = await faunaLogout(req.faunaClient);

      // clear the token cookie for the user
      res.clearCookie(process.env.TOKEN_COOKIE);

      // redirect to home
      res.redirect(303, "/");
      return;
    } catch (error) {
      console.error(error);
      next(error);
    }
  },
};

module.exports = logout;
