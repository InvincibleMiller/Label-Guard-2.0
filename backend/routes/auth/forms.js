const {
  getAllFormsForLocation,
  locationBelongsToUser,
  createFormDoc,
} = require("../../fauna/queries");

const { encrypt } = require("../../../util/crypto");

const getForms = async (req, res, next) => {
  try {
    const locationID = req.cookies[process.env.LOCATION_ID_COOKIE];
    const { id: userID } = req.userDocument;

    if (!locationID) {
      throw new Error("Request must include location id");
    }

    if (!userID) {
      throw new Error("Request must include user id");
    }

    const { data: userOwnsLocation } = await locationBelongsToUser(
      userID,
      locationID
    );

    if (!userOwnsLocation) {
      throw new Error("Location must belong to user");
    }

    const { data: result } = await getAllFormsForLocation(locationID);

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const registerForm = async (req, res, next) => {
  try {
    // perform user input validation
    const {
      "form-name": name,
      "form-description": description,
      "form-password": password,
      "form-confirm": confirm,
    } = req.body;

    const locationID = req.cookies[process.env.LOCATION_ID_COOKIE];
    const { id: userID } = req.userDocument;

    if (!name) {
      res.status(422).json({ status: 422, message: "Form name is required!" });
      return;
    }

    // make sure the description is less than 80 chars
    // and that it exists
    if (!description || description.length > 80) {
      res.status(422).json({
        status: 422,
        message: "Description can't be greater than 80 characters long!",
      });
      return;
    }

    // make sure the passwords match
    if (password != confirm || !password || !confirm) {
      res.status(422).json({
        status: 422,
        message: "Passwords don't match!",
      });
      return;
    }

    // make sure the password is at least 4 chars
    if (password.length < 4) {
      res.status(422).json({
        status: 422,
        message: "Password must be at least 4 characters long!",
      });
      return;
    }

    // make sure the location ID cookie exists
    if (locationID == undefined) {
      res.status(422).json({
        status: 422,
        message: "No location ID provided!",
      });
      return;
    }

    if (!userID) {
      throw new Error("Request must include user id");
    }

    // The user must own the location of the form their trying to create
    const { data: userOwnsLocation } = await locationBelongsToUser(
      userID,
      locationID
    );

    if (!userOwnsLocation) {
      res.status(422).json({
        status: 422,
        message: "User doesn't own this store!",
      });
      return;
    }

    //
    // # After user validation
    //

    // a hashed version of the password will be stored on Fauna DB
    const encryptedPassword = encrypt(password);

    // this is the data object passed to Fauna DB
    const formSkeleton = {
      location_id: locationID,
      name,
      description,
      password: encryptedPassword,
    };

    console.log(formSkeleton);

    // create the form document on Fauna DB
    const { data: createFormResult } = await createFormDoc(formSkeleton);

    res.status(200).json(createFormResult);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = { getForms, registerForm };
