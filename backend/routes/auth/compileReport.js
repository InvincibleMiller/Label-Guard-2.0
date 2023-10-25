const moment = require("moment");
const Lo = require("lodash");
const {
  getLocationSettings,
  getDefaultSettings,
  getViolationPairs,
  getAllProductsForLocation,
  getAllShiftsForLocation,
  getAllViolationsForLocation,
  getFindingReportsByDate,
} = require("../../fauna/queries");

const compileReport = async (req, res, next) => {
  try {
    // expects start and end date from query params
    // dates are expected to be formatted as YYYY-MM-DD
    // const { id: userID } = req.userDocument;
    let { from, to, utcOffset } = req.query;
    const locationID = req.cookies[process.env.LOCATION_ID_COOKIE];

    // make sure client input exists
    if (from === undefined || to === undefined) {
      res.status(422).json("must include from/to");
      return;
    }

    // sort from and to so that they are in order
    // first to last by date
    [from, to] = (() =>
      [from, to].sort((a, b) => {
        moment(a).valueOf() - moment(b).valueOf();
      }))();

    const fromMoment = moment(from);
    const fromDate = fromMoment.toDate();

    const locationSettings =
      (await getLocationSettings(locationID)) || getDefaultSettings();
    const { maximum_repeat_threshold } = locationSettings;

    // we'll want to grab all the violation pairs
    // including ones from {maximum_repeat_threshold} before the range
    // otherwise, we'll neglect that some may be repeats

    // here i'm being lazy and one-lining it :)
    // this pads the range
    const [paddedStartMoment, paddedEndMoment] = [from, to].map((day, index) =>
      moment(day).add(
        [-maximum_repeat_threshold, 24 * 60 * 60 * 1000].at(index),
        "milliseconds"
      )
    );

    const [paddedStart, paddedEnd] = [paddedStartMoment, paddedEndMoment].map(
      (m) => m.toDate()
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

    const { data: findingReports } = await getFindingReportsByDate(
      locationID,
      paddedStart,
      paddedEnd
    );

    // Fetch all the violation pairs in the calculated range
    // these are ordered ASC by .found_on by default
    const { data: violationPairs } = await getViolationPairs(
      locationID,
      paddedStart,
      paddedEnd
    );

    const hashVP = ({ violation_id, product_id }) =>
      `${violation_id},${product_id}`;

    // used to record specific findings
    const violationRecord = {};

    // used to determine the time elapsed between violations
    const specificFindingRecord = {};

    // useful for finding the average frequency of
    // a specific finding
    const daysElapsed = paddedEndMoment.diff(fromMoment, "days");
    const reportProfile = {
      totalWeight: 0,
      repeatFindings: 0,
      findings: 0,
      nonRepeatFindings: 0,
      daysElapsed: Lo.round(daysElapsed, 2),
      weeksElapsed: Lo.round(daysElapsed / 7, 2),
    };
    const findingProfiles = {};
    const violationProfiles = {};
    const shiftProfiles = {};
    const productProfiles = {};

    const findingReportsPerShift = Lo.mapValues(
      Lo.countBy(findingReports, ({ shift_id }) => shiftsById[shift_id].name),
      (count) => ({
        weekly: Lo.round(count / (daysElapsed / 7), 2),
        daily: Lo.round(count / daysElapsed, 2),
        total: count,
      })
    );

    // Find all the repeats
    // but filter out any that were including
    // because of padding
    const weightedFindings = violationPairs
      .map((violationPair) => {
        const hash = hashVP(violationPair);
        const { product_id, violation_id, shift_id, corrective } =
          violationPair;
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
          specificRepeat: false,
        };

        // check if the finding is a repeat by violation and adjust the weight accordingly
        if (
          violationRecord[violation_id] &&
          maximum_repeat_threshold >
            found_on.valueOf() - violationRecord[violation_id]
        ) {
          weightedFinding.repeat = true;
          weightedFinding.weight = violationDoc.repeat_weight;
        }
        // do that same thing but consider violation & product
        if (
          specificFindingRecord[hash] &&
          maximum_repeat_threshold >
            found_on.valueOf() - specificFindingRecord[hash]
        ) {
          weightedFinding.specificRepeat = true;
        }

        // effectively save the most recent occurrence date
        // of this violation (this is how we find repeats)
        violationRecord[violation_id] = found_on.valueOf();
        // save a record of specific repeats too (by violation & product)
        specificFindingRecord[hash] = found_on.valueOf();

        // before continuing (updating the report)
        // make sure that this finding isn't outside of the real range
        if (found_on.valueOf() < fromMoment.valueOf()) {
          return null;
        }

        reportProfile.findings += 1;
        reportProfile.repeatFindings += weightedFinding.repeat ? 1 : 0;
        reportProfile.nonRepeatFindings += weightedFinding.repeat ? 0 : 1;
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

        return weightedFinding;
      })
      .filter((v) => v != null);

    // group findings by day
    const weightedFindingsByDate = Lo.groupBy(weightedFindings, ({ date }) =>
      date.format("YYYY-MM-DD")
    );

    const weightedByDate = Array(daysElapsed)
      .fill(0)
      .map((_, i) => {
        const m = moment(fromMoment);
        m.add(i, "days");

        const momentString = m.format("YYYY-MM-DD");

        const weightedDay = {
          date: momentString,
          weight: 0,
        };

        if (weightedFindingsByDate[momentString]) {
          weightedDay.weight = weightedFindingsByDate[momentString].reduce(
            (sum, n) => sum + n.weight,
            0
          );
        }

        return weightedDay;
      });

    // group findings by violation
    const weightedFindingsByViolation = Lo.groupBy(
      weightedFindings,
      ({ violation }) => violation
    );

    res.status(200).json({
      findingProfiles,
      weightedByDate,
      productProfiles,
      shiftProfiles,
      findingReportsPerShift,
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
