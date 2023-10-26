// add bootstrap css
import "bootstrap/dist/css/bootstrap.css";
// dashboard styling
import "./dashboard.css";

// component imports
import Link from "next/link";
import NavBarHighlighter from "@/components/NavBarHighlighter";
import LogoutButton from "@/components/LogoutButton";
import { NavLink } from "@/components/NavBar";

// user validation imports
import { cookies } from "next/headers";
import { decrypt } from "@/util/crypto";
import { getStripe } from "@/util/stripe";
import {
  getLocationDocumentById,
  getAllLocationsForUser,
} from "@/backend/fauna/queries";

import LocationSwitcher from "@/components/LocationSwitcher";

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
  const { value: userID } = getCookie(process.env.USER_ID_COOKIE);

  if (!locationId || locationId == undefined) {
    throw new Error("No Location Id!");
  }

  // Save the locationId to params so it can be
  // easily accessed by the page view
  params.locationId = locationId;

  const { data: locationDoc } = await getLocationDocumentById(locationId);

  const { data: allLocations } = await getAllLocationsForUser(userID);

  if (!locationDoc || locationDoc == undefined) {
    // TODO — Throw an error about null locations
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
        <header className="container-fluid shadow-sm mb-4 sticky-header">
          <div className="row">
            <div className="col bg-primary text-light">
              <div className="container-xl py-2">
                <div className="row py-2">
                  <div className="col d-flex justify-content-between align-items-center">
                    <h4 className="fw-bold mb-0">Label Guard</h4>
                    <div className="d-flex align-items-center gap-4">
                      <LocationSwitcher
                        locationDoc={locationDoc}
                        locations={allLocations}
                      />
                      <LogoutButton className={"btn btn-outline-light"} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="container-xl bg-body-tertiary">
              <nav className="navbar navbar-expand-lg">
                <div className="container-xl justify-content-end">
                  <button
                    className="navbar-toggler ml-auto"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarToggle"
                    aria-controls="navbarToggle"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                  >
                    <span className="navbar-toggler-icon"></span>
                  </button>
                  <div
                    className="mt-2 mt-lg-0 collapse navbar-collapse"
                    id="navbarToggle"
                  >
                    <ul className="navbar-nav nav-pills nav-justified gap-1 m-auto fw-semibold">
                      <li className="nav-item">
                        <NavLink className="nav-link" href="/auth/dashboard/">
                          Dashboard
                        </NavLink>
                      </li>
                      <li className="nav-item">
                        <NavLink href="/auth/dashboard/reports/">
                          Reports
                        </NavLink>
                      </li>
                      <li className="nav-item">
                        <NavLink href="/auth/dashboard/violations/">
                          Violations
                        </NavLink>
                      </li>
                      <li className="nav-item">
                        <NavLink href="/auth/dashboard/inventory/">
                          Inventory
                        </NavLink>
                      </li>
                      <li className="nav-item">
                        <NavLink href="/auth/dashboard/shifts/">Shifts</NavLink>
                      </li>
                      <li className="nav-item">
                        <NavLink href="/auth/dashboard/forms/">Forms</NavLink>
                      </li>
                    </ul>
                    <NavBarHighlighter />
                  </div>
                </div>
              </nav>
            </div>
          </div>
        </header>
        <div className="container-fluid">
          <div
            className="alert alert-info alert-dismissible fade show"
            role="alert"
          >
            {(subscriptionActive && "USER SUBSCRIPTION VERIFIED") ||
              "SO SORRY..."}
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="alert"
              aria-label="Close"
            ></button>
          </div>
          <div className="container-xl">{children}</div>
        </div>
        <script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-HwwvtgBNo3bZJJLYd8oVXjrBZt8cqVSpeBNS5n7C8IVInixGAoxmnlMuBnhbgrkm"
          crossOrigin="anonymous"
        ></script>
      </body>
    </html>
  );
}
