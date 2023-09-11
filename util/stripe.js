const Stripe = require("stripe");

let stripeClient = null;

function getStripe() {
  if (!stripeClient) {
    stripeClient = Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-08-16",
    });
  }

  return stripeClient;
}

module.exports = { getStripe };
