const { getAllLocationsForUser } = require("../../fauna/queries");

// GET
const getAllLocations = async (req, res, next) => {
  try {
    const { id: userID } = req.userDocument;
    const allLocations = await getAllLocationsForUser(userID);

    res.status(200).json(allLocations);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = getAllLocations;
