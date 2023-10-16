const {
  deleteFindingReportDocument,
  getViolationPairsFromFindingDocument,
  getFindingReportDocument: getFindingReportDocumentFromFauna,
  deleteDocument,
  updateDocument,
} = require("../../fauna/queries");

const moment = require("moment");

// POST
const deleteFindingReport = async (req, res, next) => {
  try {
    const locationID = req.cookies[process.env.LOCATION_ID_COOKIE];
    const { documentID } = req.body;

    if (documentID === undefined || locationID === undefined) {
      throw new Error("Request must include documentID AND locationID");
    }

    const { data: deleteData } = await deleteFindingReportDocument(
      locationID,
      documentID
    );

    res.status(200).json(deleteData);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// GET
const getFindingReportDocument = async (req, res, next) => {
  try {
    const locationID = req.cookies[process.env.LOCATION_ID_COOKIE];
    const { documentID } = req.query;

    if (documentID === undefined || locationID === undefined) {
      throw new Error("Request must include documentID AND locationID");
    }

    const violationPairList = await getViolationPairsFromFindingDocument(
      locationID,
      documentID
    );

    const findingDocument = await getFindingReportDocumentFromFauna(
      locationID,
      documentID
    );

    res.status(200).json({ ...findingDocument, findings: violationPairList });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const editFindingReport = async (req, res, next) => {
  try {
    // the payload is expected to be in this format:
    // {
    //   date,
    //   deletedFindings,
    //   documentID,
    //   findings,
    //   full_name,
    //   shift_id,
    // }

    const locationID = req.cookies[process.env.LOCATION_ID_COOKIE];
    const { date, deletedFindings, documentID, findings, full_name, shift_id } =
      req.body;

    // validate user input

    if (
      date === undefined ||
      deletedFindings === undefined ||
      documentID === undefined ||
      findings === undefined ||
      full_name === undefined ||
      shift_id === undefined
    ) {
      throw new Error(
        "Expected input: { date, deletedFindings, documentID, findings, full_name, shift_id }"
      );
    }

    const dateObject = moment(date).toDate();

    // get the original document
    // we use this to further validate input
    const originalFindingReport = await getFindingReportDocumentFromFauna(
      locationID,
      documentID
    );

    console.log(originalFindingReport);

    // confirm that the client owns the document
    if (originalFindingReport.location_id !== locationID) {
      throw new Error("Must own provided document");
    }

    // filter out any documents that may not belong to the client
    const verifiedDeletableFindings = originalFindingReport.findings.filter(
      (finding) => deletedFindings.includes(finding)
    );

    // filter out any documents that may not belong to the client
    const verifiedUpdatableFindings = Object.keys(findings).reduce(
      (verified, findingKey) => {
        if (
          originalFindingReport.findings.includes(findingKey) &&
          !deletedFindings.includes(findingKey)
        ) {
          verified[findingKey] = findings[findingKey];
        }
        return verified;
      },
      {}
    );

    // if there are any deleted findings
    //    remove them from the document & delete each
    //    violation pair document too
    await Promise.all(
      verifiedDeletableFindings.map(async (findingId) => {
        return await deleteDocument(locationID, findingId, "VIOLATION_PAIRS");
      })
    );

    // if any findings have been updated,
    //    update the violation pair document.
    await Promise.all(
      Object.keys(verifiedUpdatableFindings).map(async (findingKey) => {
        const finding = verifiedUpdatableFindings[findingKey];

        return await updateDocument(locationID, findingKey, "VIOLATION_PAIRS", {
          violation_id: finding.violation_id,
          product_id: finding.product_id,
          corrective: finding.corrective,
          found_on: dateObject,
        });
      })
    );

    // finally update the finding document
    const updatedFindingReport = await updateDocument(
      locationID,
      documentID,
      "FINDING_REPORTS",
      {
        date: dateObject,
        full_name: full_name,
        shift_id: shift_id,
        findings: Object.keys(verifiedUpdatableFindings),
      }
    );

    res.status(200).json(updatedFindingReport);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = {
  deleteFindingReport,
  getFindingReportDocument,
  editFindingReport,
};
