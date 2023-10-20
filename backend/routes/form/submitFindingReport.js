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
        finding.product.id,
        shift.id,
        finding.violation.id,
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

module.exports = submitFindingReport;
