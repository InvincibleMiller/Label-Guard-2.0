const { encrypt } = require("../../../util/crypto");
const { getStripe } = require("../../../util/stripe");

const { createLocationDocument } = require("../../fauna/queries");

const registerLocation = {
  post: async (req, res, next) => {
    try {
      const {
        userDocument: { id: userId, email: userEmail },
        body: { description, name },
      } = req;

      // Validate user input
      if (description.length > 80) {
        res.status(422).json({ status: 422, message: "Description too long!" });
        return;
      }

      //
      // # Now that user input has been validated
      // # proceed
      //

      const stripe = getStripe();

      // create a stripe customer for the location
      const { id: customerId } = await stripe.customers.create({
        email: userEmail,
        name,
        description,
      });

      // store the stripe customer id in the location document
      // but encrypt it using encrypt() so that were not storing
      // raw stripe data on Fauna DB.
      const encryptedCustomerId = encrypt(customerId);

      // Create the locationDocument in Fauna DB
      const locationDocumentTemplate = {
        name: name,
        description: description,
        admin_id: userId,
        stripe_customer_id: encryptedCustomerId,
        location_settings_id: null, // TODO - implement location settings
      };

      const { data: locationDocument } = await createLocationDocument(
        locationDocumentTemplate
      );

      // check to make sure the document was created
      if (!locationDocument) {
        // do something
        return;
      }

      // store a cookie with the locations ID in it for the Dashboard
      res.cookie(process.env.LOCATION_ID_COOKIE, locationDocument.id);

      // add "customer-id" to the payload so that a checkout
      // page can be generated
      req.body["customer-id"] = encryptedCustomerId;

      next();
      return;
    } catch (error) {
      console.error(error);
      next(error);
    }
  },
};

module.exports = registerLocation;
