const {
  createShiftDoc,
  getAllShiftsForLocation,
  locationBelongsToUser,
} = require("../../fauna/queries");

const getShifts = async (req, res, next) => {
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

    const { data: result } = await getAllShiftsForLocation(locationID);

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const registerShift = async (req, res, next) => {
  try {
    const { "shift-name": name, "shift-minimum": minimum } = req.body;
    const locationID = req.cookies[process.env.LOCATION_ID_COOKIE];
    const { id: userID } = req.userDocument;

    if (!name) {
      res.status(422).json({ status: 422, message: "Shift name is required!" });
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

    const shiftSkeleton = {
      location_id: locationID,
      name: name,
      minimum: parseInt(minimum),
    };

    // create the form document on Fauna DB
    const { data: createShiftResult } = await createShiftDoc(shiftSkeleton);

    res.status(200).json(createShiftResult);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = { getShifts, registerShift };
