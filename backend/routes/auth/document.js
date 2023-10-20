const {
  locationBelongsToUser,
  getDocument: getDocumentFromCollection,
  updateDocument: updateDocumentInCollection,
  deleteDocument: deleteDocumentInCollection,
} = require("../../fauna/queries");

const getDocument = async (req, res, next) => {
  try {
    const { id: userID } = req.userDocument;
    const locationID = req.cookies[process.env.LOCATION_ID_COOKIE];
    const { documentID, documentCollection } = req.params;

    if (!documentID || !documentCollection) {
      throw new Error("INVALID DOCUMENT ID OR COLLECTION");
    }

    if (!locationID) {
      throw new Error("Request must include location id");
    }

    if (!userID) {
      throw new Error("Request must include user id");
    }

    const document = await getDocumentFromCollection(
      documentID,
      documentCollection
    );

    res.status(200).json(document);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const updateFormDocument = async (req, res, next) => {
  try {
    const { id: userID } = req.userDocument;
    const locationID = req.cookies[process.env.LOCATION_ID_COOKIE];
    const { id: documentID, type: documentType, name, description } = req.body;

    if (
      name == undefined ||
      description == undefined ||
      documentID == undefined ||
      documentType == undefined
    ) {
      throw new Error("Undefined input");
    }

    //
    // # After user input validation
    //

    // update the document
    const { data: update_result } = await updateDocumentInCollection(
      locationID,
      documentID,
      documentType,
      {
        name,
        description,
      }
    );

    if (update_result) {
      res.status(200).json(update_result);
    } else {
      throw new Error("Document ownership inconsistency");
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const updateShiftDocument = async (req, res, next) => {
  try {
    const { id: userID } = req.userDocument;
    const locationID = req.cookies[process.env.LOCATION_ID_COOKIE];
    const { id: documentID, type: documentType, name, minimum } = req.body;

    if (
      name == undefined ||
      minimum == undefined ||
      documentID == undefined ||
      documentType == undefined
    ) {
      throw new Error("Undefined input");
    }

    //
    // # After user input validation
    //

    // update the document
    const { data: update_result } = await updateDocumentInCollection(
      locationID,
      documentID,
      documentType,
      {
        name,
        minimum: parseInt(minimum),
      }
    );

    if (update_result) {
      res.status(200).json(update_result);
    } else {
      throw new Error("Document ownership inconsistency");
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const updateProductDocument = async (req, res, next) => {
  try {
    const { id: userID } = req.userDocument;
    const locationID = req.cookies[process.env.LOCATION_ID_COOKIE];
    const { id: documentID, type: documentType, name } = req.body;

    if (
      name == undefined ||
      documentID == undefined ||
      documentType == undefined
    ) {
      throw new Error("Undefined input");
    }

    //
    // # After user input validation
    //

    // update the document
    const { data: update_result } = await updateDocumentInCollection(
      locationID,
      documentID,
      documentType,
      {
        name,
      }
    );

    if (update_result) {
      res.status(200).json(update_result);
    } else {
      throw new Error("Document ownership inconsistency");
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const updateViolationDocument = async (req, res, next) => {
  try {
    const { id: userID } = req.userDocument;
    const locationID = req.cookies[process.env.LOCATION_ID_COOKIE];
    const {
      id: documentID,
      type: documentType,
      name,
      weight,
      repeat_weight,
    } = req.body;

    if (
      name == undefined ||
      weight == undefined ||
      repeat_weight == undefined ||
      documentID == undefined ||
      documentType == undefined
    ) {
      throw new Error("Undefined input");
    }

    //
    // # After user input validation
    //

    // update the document
    const { data: update_result } = await updateDocumentInCollection(
      locationID,
      documentID,
      documentType,
      {
        name,
        weight: parseInt(weight),
        repeat_weight: parseInt(repeat_weight),
      }
    );

    if (update_result) {
      res.status(200).json(update_result);
    } else {
      throw new Error("Document ownership inconsistency");
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const deleteDocument = async (req, res, next) => {
  try {
    const { id: userID } = req.userDocument;
    const locationID = req.cookies[process.env.LOCATION_ID_COOKIE];
    const { id: documentID, type: documentType } = req.body;

    if (documentID == undefined || documentType == undefined) {
      throw new Error("Undefined input");
    }

    const { data: userOwnsLocation } = await locationBelongsToUser(
      userID,
      locationID
    );

    if (!userOwnsLocation) {
      throw new Error("Location must belong to user");
    }

    //
    // # User validation passed, continue
    //

    const delete_result = await deleteDocumentInCollection(
      locationID,
      documentID,
      documentType
    );

    res.status(200).json(delete_result);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = {
  getDocument,
  deleteDocument,
  updateFormDocument,
  updateShiftDocument,
  updateProductDocument,
  updateViolationDocument,
};
