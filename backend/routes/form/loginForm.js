const { loginToForm: loginToFormOnFauna } = require("../../fauna/queries");
const { encrypt } = require("../../../util/crypto");

async function loginToForm(req, res, next) {
  try {
    const { "form-password": password, formID } = req.body;

    // user input validation
    if (password == undefined || formID == undefined) {
      res.status(422).json({ status: 422, message: "Missing input!" });
      return;
    }

    // try to login to the form and return the objects
    // returns { form: {}, location: {} }

    const results = await loginToFormOnFauna(formID, password);

    if (typeof results != "object") {
      res.status(403).json({ status: 403, message: results });
      return;
    }

    res.status(200).json(results);
  } catch (error) {
    console.error(error);
    next(error);
  }
}

module.exports = { loginToForm };
