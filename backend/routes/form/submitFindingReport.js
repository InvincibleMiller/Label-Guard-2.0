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

    /**
     * first step is: get the location's settings
     *  ```fql
     *    LocationSettings.byLocationId(${location_id}).first()
     *  ```
     *
     * if the return == null, use generic settings
     * (i.e maximum repeat threshold = 7 days)
     *
     * but regardless, the main thing we need from
     * these settings is the maximum_repeat_threshold
     *
     * Now for every finding:
     *
     * add an entry in the repeat skeleton for the current finding:
     * {
     *   violation_name: "",
     *   product_name: "",
     *   weight: default_weight,
     *   repeat: false,
     * }
     *
     * check if an existing ViolationPair document corresponds to it:
     *
     * if not:
     *  create the ViolationPair and set the lastOccurrence date to NOW.
     *
     * else:
     *  if (NOW < lastOccurrence + maximum_repeat_threshold):
     *    # we found a repeat!
     *
     *    # in the ReportSkeleton set the repeat status to TRUE
     *    # and adjust the weight to the repeat weight.
     *
     *    # Repeat documents are useful for visualizing the lifetime
     *    # of issues in a restaurant. (How often did recurring issues survive?)
     *    if a Repeat document exists where \
     *      (NOW < Repeat.lastOccurrence + maximum_repeat_threshold):
     *
     *      # extend the lastOccurrence date to NOW
     *      Repeat.lastOccurrence = NOW
     *
     *    else:
     *      create a repeat document {
     *        violation_pair_id,
     *        found_on: NOW,
     *        last_occurrence: NOW,
     *      }
     */
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports = submitFindingReport;
