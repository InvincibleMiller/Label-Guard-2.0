const moment = require("moment");
const {
  // getLocationSettings,
  // getLastViolationPair,
  createViolationPair,
  createFindingReportDocument,
} = require("../../fauna/queries");

// POST
const submitFindingReport = async (req, res, next) => {
  try {
    const { fullName, shift, date, findings, location, form } = req.body;

    // TODO - perform server side input validation

    // get the current time once so that it is constant
    // throughout this report compilation
    const NOW = moment(date).valueOf();
    const date_NOW = new Date(NOW);

    // create a violation pair for every single finding
    const compiledFindingsPromise = findings.map(async (finding, index) => {
      const newViolationPair = await createViolationPair(
        location.id,
        finding.violation.id,
        finding.product.id,
        finding.corrective,
        date_NOW
      );

      // this returns a promise
      return newViolationPair.id;
    });

    // resolve every promise before continuing
    const compiledFindings = await Promise.all(compiledFindingsPromise);

    // organize all the data into the format stored in FaunaDB
    const findingReportSkeleton = {
      location_id: location.id,
      form_id: form.id,
      date: date_NOW,
      full_name: fullName,
      shift_id: shift.id,
      findings: compiledFindings,
    };

    // create the new FindingReport document over in Fauna DB
    // and return it to the client
    const findingReportResult = await createFindingReportDocument(
      findingReportSkeleton
    );

    res.status(200).json(findingReportResult);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// ## Repeat Tracking Logic (old system)

// //
// // get the location settings
// //
// const locationSettings = (await getLocationSettings(location.id)) || {
//   // Milliseconds in a week
//   maximum_repeat_threshold: 7 * 24 * 60 * 60 * 1000,
// };
// // Destructure settings for easy access later
// const { maximum_repeat_threshold } = locationSettings;

// const violationPairs = {};

// // for each finding

// const findingEntry = {
//   violation_name: finding.violation.name,
//   product_name: finding.product.name,
//   weight: finding.violation.weight,
//   repeat: false,
// };

// // get the most recent corresponding ViolationPair
// // if it exists relative to the current timestamp (NOW)

// // store these in a cache
// const vp_hash = finding.violation.id + finding.product.id + NOW;

// if (violationPairs[vp_hash] === undefined) {
//   violationPairs[vp_hash] = await getLastViolationPair(
//     finding.violation.id,
//     finding.product.id,
//     date_NOW
//   );
// }

// if (violationPairs[vp_hash]) {
//   // The ViolationPair exists
//   // Check if this finding is a repeat
//   if (
//     NOW <
//     violationPairs[vp_hash].last_occurrence + maximum_repeat_threshold
//   ) {
//     // This finding is a repeat
//     findingEntry.repeat = true;
//     findingEntry.weight = finding.violation.repeat_weight;
//   }
// }

module.exports = submitFindingReport;
