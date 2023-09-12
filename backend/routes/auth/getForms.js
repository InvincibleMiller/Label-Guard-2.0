const {
  getAllFormsForLocation,
  locationBelongsToUser,
} = require("../../fauna/queries");

const getForms = async (req, res, next) => {
  try {
    const { locationID } = req.cookies;
    const { id: userId } = req.userDocument;

    if (!locationID) {
      throw new Error("Request must include location id");
    }

    if (!userId) {
      throw new Error("Request must include user id");
    }

    const { data: userOwnsLocation } = await locationBelongsToUser(
      userId,
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

module.exports = { getForms };
