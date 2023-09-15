const {
  locationBelongsToUser,
  getAllProductsForLocation,
  createProductDoc,
} = require("../../fauna/queries");

const getInventory = async (req, res, next) => {
  try {
    const locationID = req.cookies[process.env.LOCATION_ID_COOKIE];
    const { id: userID } = req.userDocument;

    if (!locationID) {
      throw new Error("Request must include location id");
    }

    if (!userID) {
      throw new Error("Request must include user id");
    }

    const { data: userOwnsLocation } = await locationBelongsToUser(
      userID,
      locationID
    );

    if (!userOwnsLocation) {
      throw new Error("Location must belong to user");
    }

    const { data: result } = await getAllProductsForLocation(locationID);

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const registerProduct = async (req, res, next) => {
  try {
    console.log("Starting");

    // perform user input validation
    const { "product-name": name } = req.body;

    const locationID = req.cookies[process.env.LOCATION_ID_COOKIE];
    const { id: userID } = req.userDocument;

    if (!name) {
      res
        .status(422)
        .json({ status: 422, message: "Product name is required!" });
      return;
    }

    // make sure the location ID cookie exists
    if (locationID == undefined) {
      res.status(422).json({
        status: 422,
        message: "No location ID provided!",
      });
      return;
    }

    if (!userID) {
      throw new Error("Request must include user id");
    }

    // The user must own the location of the product their trying to create
    const { data: userOwnsLocation } = await locationBelongsToUser(
      userID,
      locationID
    );

    if (!userOwnsLocation) {
      res.status(422).json({
        status: 422,
        message: "User doesn't own this store!",
      });
      return;
    }

    //
    // # After user validation
    //

    // this is the data object passed to Fauna DB
    const productSkeleton = {
      location_id: locationID,
      name: name,
    };

    // create the form document on Fauna DB
    const { data: createProductResult } = await createProductDoc(
      productSkeleton
    );

    res.status(200).json(createProductResult);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = { getInventory, registerProduct };
