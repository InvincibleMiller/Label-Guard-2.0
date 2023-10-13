const {
  deleteFindingReportDocument,
  getViolationPairsFromFindingDocument,
  getFindingReportDocument: getFindingReportDocumentFromFauna,
} = require("../../fauna/queries");

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

module.exports = { deleteFindingReport, getFindingReportDocument };
