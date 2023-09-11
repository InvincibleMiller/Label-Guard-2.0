import { cookies } from "next/headers";

import { decrypt } from "@/util/crypto";
import { getStripe } from "@/util/stripe";

import { getLocationDocumentById } from "@/backend/fauna/queries";

export default async function page() {
  const { get: getCookie } = cookies();

  const { value: locationId } = getCookie(process.env.LOCATION_ID_COOKIE);

  if (!locationId || locationId == undefined) {
    throw new Error("No Location Id!");
  }

  const { data: locationDoc } = await getLocationDocumentById(locationId);

  if (!locationDoc || locationDoc == undefined) {
    // do something
  }

  // get the customer key and decrypt it
  const { stripe_customer_id } = locationDoc;
  const decryptedStripeCustomerId = decrypt(stripe_customer_id);

  // get the customer instance from Stripe
  const stripe = getStripe();
  const customer = await stripe.customers.retrieve(decryptedStripeCustomerId);

  if (!customer || customer == undefined) {
    throw new Error("Can't get customer from Stripe!");
  }

  // inherently customers will only have one subscription
  // due to the configuration of locations and customers.
  // So get the subscription data from the customer

  const subscriptions = await stripe.subscriptions.list({
    customer: decryptedStripeCustomerId,
  });


  const subscription = subscriptions.data[0];

  const subscriptionActive = subscription.status === "active";

  if (!subscriptionActive) {
    throw new Error("Subscription not active!");
  }

  return (
    <div>
      <h1>DASHBOARD</h1>
      {subscriptionActive && "USER SUBSCRIPTION VERIFIED"}
    </div>
  );
}
