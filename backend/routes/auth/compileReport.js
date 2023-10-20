const moment = require("moment");
const Lo = require("lodash");
const {
  getLocationSettings,
  getDefaultSettings,
  getViolationPairs,
  getAllProductsForLocation,
  getAllViolationsForLocation,
} = require("../../fauna/queries");

const compileReport = async (req, res, next) => {
  try {
    // expects start and end date from query params
    // dates are expected to be formatted as YYYY-MM-DD
    // const { id: userID } = req.userDocument;
    const { from, to } = req.query;
    const locationID = req.cookies[process.env.LOCATION_ID_COOKIE];

    const locationSettings =
      (await getLocationSettings(locationID)) || getDefaultSettings();
    const { maximum_repeat_threshold } = locationSettings;

    // we'll want to grab all the violation pairs
    // including ones from {maximum_repeat_threshold} before the range
    // otherwise, we'll neglect that some may be repeats

    // here i'm being lazy and one-lining it :)
    const [start, end] = [from, to].map((day, index) =>
      moment(day)
        .add(maximum_repeat_threshold * [-1, 0].at(index), "milliseconds")
        .toDate()
    );

    const {
      data: { data: violations },
    } = await getAllViolationsForLocation(locationID);
    const violationsById = Lo.keyBy(violations, "id");

    const {
      data: { data: products },
    } = await getAllProductsForLocation(locationID);
    const productsById = Lo.keyBy(products, "id");

    // Fetch all the violation pairs in the calculated range
    // these are ordered ASC by .found_on by default
    const { data: violationPairs } = await getViolationPairs(
      locationID,
      start,
      end
    );

    const hashVP = ({ violation_id, product_id }) => violation_id + product_id;
    const foundOnRecord = {};

    // Find all the repeats
    const weightedFindings = violationPairs.map((violationPair) => {
      const hash = hashVP(violationPair);
      const { product_id, violation_id } = violationPair;
      const found_on = moment(violationPair.found_on);

      // save these documents for convenience
      const violationDoc = violationsById[violation_id];
      const productDoc = productsById[product_id];

      // initialize the weightedFinding
      const weightedFinding = {
        violation: violationDoc.name,
        product: productDoc.name,
        weight: violationDoc.weight,
        repeat: false,
        date: found_on,
      };

      // check if the finding is a repeat and adjust the weight accordingly
      if (
        foundOnRecord[hash] &&
        maximum_repeat_threshold > found_on.valueOf() - foundOnRecord[hash]
      ) {
        weightedFinding.repeat = true;
        weightedFinding.weight = violationDoc.repeat_weight;
      }

      // effectively save the most recent date
      // of this finding type
      foundOnRecord[hash] = found_on.valueOf();

      return weightedFinding;
    });

    // group findings by day
    const weightedFindingsByDate = Lo.groupBy(weightedFindings, ({ date }) =>
      date.format("YYYY-MM-DD")
    );

    res.status(200).json(weightedFindingsByDate);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports = compileReport;
