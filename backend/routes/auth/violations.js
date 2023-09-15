const {
  getAllViolationsForLocation,
  locationBelongsToUser,
  createViolationDoc,
} = require("../../fauna/queries");

const getViolations = async (req, res, next) => {
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

    const { data: result } = await getAllViolationsForLocation(locationID);

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const registerViolation = async (req, res, next) => {
  try {
    const {
      "violation-name": name,
      "violation-weight": weight,
      "violation-repeat-weight": repeatWeight,
    } = req.body;
    const locationID = req.cookies[process.env.LOCATION_ID_COOKIE];
    const { id: userID } = req.userDocument;

    if (!name) {
      res
        .status(422)
        .json({ status: 422, message: "Violation name is required!" });
      return;
    }

    if (!weight) {
      res
        .status(422)
        .json({ status: 422, message: "Violation weight is required!" });
      return;
    }

    if (!repeatWeight) {
      res
        .status(422)
        .json({ status: 422, message: "Violation repeat weight is required!" });
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

    const violationSkeleton = {
      location_id: locationID,
      name: name,
      weight: parseInt(weight),
      repeat_weight: parseInt(repeatWeight),
    };

    // create the shift document on Fauna DB
    const { data: createViolationResult } = await createViolationDoc(
      violationSkeleton
    );

    res.status(200).json(createViolationResult);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = { getViolations, registerViolation };
