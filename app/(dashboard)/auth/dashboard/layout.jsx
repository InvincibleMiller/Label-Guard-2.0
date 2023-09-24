// add bootstrap css
import "bootstrap/dist/css/bootstrap.css";
// dashboard styling
import "./dashboard.css";

// component imports
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

// user validation imports
import { cookies } from "next/headers";
import { decrypt } from "@/util/crypto";
import { getStripe } from "@/util/stripe";
import { getLocationDocumentById } from "@/backend/fauna/queries";

export const metadata = {
  title: {
    template: "Label Guard | %s",
    default: "Label Guard | Dashboard",
  },
  description: "The restaurant violation and repeat tracking app.",
};

export default async function RootLayout({ children, params }) {
  const { get: getCookie } = cookies();

  const { value: locationId } = getCookie(process.env.LOCATION_ID_COOKIE);

  if (!locationId || locationId == undefined) {
    throw new Error("No Location Id!");
  }

  // Save the locationId to params so it can be
  // easily accessed by the page view
  params.locationId = locationId;

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
    <html lang="en">
      <body>
        {subscriptionActive && "USER SUBSCRIPTION VERIFIED"}
        <h1>Label Guard</h1>
        <h3>{locationDoc.name}</h3>
        <LogoutButton />
        <ul>
          <li>
            <Link href="/auth/dashboard/">Dashboard</Link>
          </li>
          <li>
            <Link href="/auth/dashboard/reports/">Reports</Link>
          </li>
          <li>
            <Link href="/auth/dashboard/violations/">Violations</Link>
          </li>
          <li>
            <Link href="/auth/dashboard/inventory/">Inventory</Link>
          </li>
          <li>
            <Link href="/auth/dashboard/shifts/">Shifts</Link>
          </li>
          <li>
            <Link href="/auth/dashboard/forms/">Forms</Link>
          </li>
        </ul>
        {children}
        <script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-HwwvtgBNo3bZJJLYd8oVXjrBZt8cqVSpeBNS5n7C8IVInixGAoxmnlMuBnhbgrkm"
          crossOrigin="anonymous"
        ></script>
      </body>
    </html>
  );
}
