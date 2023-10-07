const {
  getAllShiftsForLocation,
  getAllProductsForLocation,
  getAllViolationsForLocation,
} = require("../../fauna/queries");

async function getLocationData(req, res, next) {
  try {
    const { locationID } = req.query;

    if (locationID == undefined) {
      throw new Error("Location ID cannot be undefined!");
    }

    // get the data for the location and send it back
    const { data: inventory } = await getAllProductsForLocation(locationID);
    const { data: shifts } = await getAllShiftsForLocation(locationID);
    const { data: violations } = await getAllViolationsForLocation(locationID);

    const responseBody = {
      inventory: inventory.data,
      shifts: shifts.data,
      violations: violations.data,
    };

    res.status(200).json(responseBody);
  } catch (error) {
    console.error(error);
    next(error);
  }
}

module.exports = { getLocationData };
