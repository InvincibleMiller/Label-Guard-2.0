const { decrypt } = require("../../../util/crypto");
const { getStripe } = require("../../../util/stripe");

const { getLocationDocumentById } = require("../../fauna/queries");

// get the location id from a cookie
// fetch the encrypted stripe id from
// the Location document on Fauna DB
const verifySubscription = {
  get: async (req, res, next) => {
    try {
      if (!locationId || locationId == undefined) {
        throw new Error("No Location Id!");
      }

      const { data: locationDoc } = await getLocationDocumentById(locationId);

      if (!locationDoc || locationDoc == undefined) {
        // do something
      }

      // get the customer key and decrypt it
      const { stripe_customer_id } = data;
      const decryptedStripeCustomerId = decrypt(stripe_customer_id);

      // get the customer instance from Stripe
      const stripe = getStripe();
      const customer = await stripe.customers.retrieve(
        decryptedStripeCustomerId
      );

      if (!customer || customer == undefined) {
        throw new Error("Can't get customer from Stripe!");
      }

      // inherently customers will only have one subscription
      // due to the configuration of locations and customers.
      // So get the subscription data from the customer
      const subscription = customer.subscriptions.data[0];

      const subscriptionActive = subscription.status === "active";

      res.status(200).json({ active: subscriptionActive });
    } catch (error) {
      console.error(error);
      next(error);
    }
  },
};

module.exports = verifySubscription;
