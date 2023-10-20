const moment = require("moment");
const Lo = require("lodash");
const {
  getLocationSettings,
  getDefaultSettings,
  getViolationPairs,
  getAllProductsForLocation,
  getAllShiftsForLocation,
  getAllViolationsForLocation,
} = require("../../fauna/queries");

const compileReport = async (req, res, next) => {
  try {
    // expects start and end date from query params
    // dates are expected to be formatted as YYYY-MM-DD
    // const { id: userID } = req.userDocument;
    const { from, to } = req.query;
    const locationID = req.cookies[process.env.LOCATION_ID_COOKIE];

    // make sure client input exists
    if (from === undefined || to === undefined) {
      res.status(422).json("must include from/to");
      return;
    }

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
      data: { data: shifts },
    } = await getAllShiftsForLocation(locationID);
    const shiftsById = Lo.keyBy(shifts, "id");

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

    const hashVP = ({ violation_id, product_id }) =>
      `${violation_id},${product_id}`;
    const foundOnRecord = {};

    // useful for finding the average frequency of
    // a specific finding
    const reportProfile = {
      totalWeight: 0,
      repeatFindings: 0,
      findings: 0,
    };
    const findingProfiles = {};
    const violationProfiles = {};
    const shiftProfiles = {};
    const productProfiles = {};

    // Find all the repeats
    const weightedFindings = violationPairs.map((violationPair) => {
      const hash = hashVP(violationPair);
      const { product_id, violation_id, shift_id, corrective } = violationPair;
      const found_on = moment(violationPair.found_on.isoString);

      // save these documents for convenience
      const violationDoc = violationsById[violation_id];
      const productDoc = productsById[product_id];

      // initialize the weightedFinding
      const weightedFinding = {
        corrective,
        date: found_on,
        product: productDoc.name,
        repeat: false,
        violation: violationDoc.name,
        weight: violationDoc.weight,
      };

      // check if the finding is a repeat and adjust the weight accordingly
      if (
        foundOnRecord[hash] &&
        maximum_repeat_threshold > found_on.valueOf() - foundOnRecord[hash]
      ) {
        weightedFinding.repeat = true;
        weightedFinding.weight = violationDoc.repeat_weight;
      }

      reportProfile.findings += 1;
      reportProfile.repeatFindings += weightedFinding.repeat ? 1 : 0;
      reportProfile.totalWeight += weightedFinding.weight;

      const updateProfile = (profile, key) => {
        if (!profile[key]) {
          // create profile if needed
          profile[key] = {
            totalWeight: weightedFinding.weight,
            repeatOccurrences: weightedFinding.repeat ? 1 : 0,
            occurrences: 1,
            foundOn: [weightedFinding.date],
          };
        } else {
          profile[key].totalWeight += weightedFinding.weight;
          profile[key].repeatOccurrences += weightedFinding.repeat ? 1 : 0;
          profile[key].occurrences += 1;
          profile[key].foundOn.push(weightedFinding.date);
        }
      };

      updateProfile(
        findingProfiles,
        `${violationsById[violation_id].name} ${productsById[product_id].name}`
      );
      updateProfile(productProfiles, productsById[product_id].name);
      updateProfile(shiftProfiles, shiftsById[shift_id].name);
      updateProfile(violationProfiles, violationsById[violation_id].name);

      // effectively save the most recent date
      // of this finding type
      foundOnRecord[hash] = found_on.valueOf();

      return weightedFinding;
    });

    // group findings by day
    const weightedFindingsByDate = Lo.groupBy(weightedFindings, ({ date }) =>
      date.format("YYYY-MM-DD")
    );

    // group findings by violation
    const weightedFindingsByViolation = Lo.groupBy(
      weightedFindings,
      ({ violation }) => violation
    );

    res.status(200).json({
      findingProfiles,
      productProfiles,
      shiftProfiles,
      reportProfile,
      violationProfiles,
      weightedFindingsByDate,
      weightedFindingsByViolation,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = compileReport;
