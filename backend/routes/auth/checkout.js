const { decrypt } = require("../../../util/crypto");
const { getStripe } = require("../../../util/stripe");

const location_price = process.env.LOCATION_STRIPE_PRICE;

// the checkout route requires that the payload include a
// "customer-id" key paired with an encrypted stripe customer id
const checkout = {
  post: async (req, res, next) => {
    try {
      // decrypt the location's stripe customer ID
      const { "customer-id": encryptedCustomerId } = req.body;
      const decryptedCustomerId = decrypt(encryptedCustomerId);

      // create a checkout session with the customer ID
      const stripe = getStripe();

      const session = await stripe.checkout.sessions.create({
        success_url: process.env.NEXT_PUBLIC_URL + "auth/dashboard",
        line_items: [{ price: location_price, quantity: 1 }],
        mode: "subscription",
        customer: decryptedCustomerId,
        billing_address_collection: "required",
      });

      // Send the checkout session back to the client
      res.status(200).json({ checkoutURL: session.url });
    } catch (error) {
      console.error(error);
      next(error);
    }
  },
};

module.exports = checkout;
