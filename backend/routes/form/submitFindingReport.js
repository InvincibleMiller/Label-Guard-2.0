const moment = require("moment");

// post
const submitFindingReport = (req, res, next) => {
  try {
    // get the payload from the client.
    //
    // # The payload is expected to match this specification:
    //
    // # const payload = {
    // #   submissionFullName: String(),
    // #   submissionShift: { id },
    // #   submissionDate: moment(),
    // #   submissionFindings: [{
    // #     violation: {...},
    // #     product: {...},
    // #     corrective: String()
    // #   }],
    // # };

    const { fullName, shift, date, findings } = req.body;

    console.log(req.body);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports = submitFindingReport;
