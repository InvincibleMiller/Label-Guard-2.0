const {
  getFindingReportsByLocation,
  getTheNextPage,
} = require("../../fauna/queries");

// GET
const getFindingPage = async (req, res, next) => {
  try {
    const locationID = req.cookies[process.env.LOCATION_ID_COOKIE];
    const { limit } = req.query;
    const findingPage = await getFindingReportsByLocation(
      locationID,
      parseInt(limit || 25)
    );

    res.status(200).json(findingPage);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const getNextPage = async (req, res, next) => {
  try {
    const { pageSecret } = req.query;

    const nextPage = await getTheNextPage(pageSecret);

    res.status(200).json(nextPage);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = { getFindingPage, getNextPage };
