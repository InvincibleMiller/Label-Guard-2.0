"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

// this is the dashboard route via which
// the admin can create label check forms for their restaurant
export default function page() {
  // State for the form list
  const [locationForms, setLocationForms] = useState([]);

  // get a list of all the current forms for this location
  async function updateFormsList() {
    try {
      const { data: forms } = await fetch(
        process.env.NEXT_PUBLIC_URL + "api/auth/get-forms",
        {
          method: "GET",
          credentials: "same-origin",
        }
      );

      setLocationForms(forms);
    } catch (error) {
      console.error(error);
    }
  }

  // Pull the list when this view is loaded
  useEffect(() => {
    (async () => {
      await updateFormsList();
    })();
  }, []);

  return (
    <div>
      <h3>FORMS</h3>
      {locationForms?.length > 0 || "NO FORMS REGISTERED"}
      <ul>
        {locationForms?.map((form) => {
          return <li>{form.name || "NULL"}</li>;
        })}
      </ul>
    </div>
  );
}
