"use client";

import { Fetcher } from "@/util/fetchHelpers";

// import form state
import useFormStore from "@/app/{stores}/formStore";

import { TextInput, SubmitButton } from "@/components/FormFields";
import { useForm } from "react-hook-form";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function page({ params }) {
  const router = useRouter();

  const formStore = useFormStore();

  const { formID } = params;

  const loginForm = useForm();

  useEffect(() => formStore.clearState(), []);

  const { handleSubmit, reset: resetForm } = loginForm;

  async function loginToForm(formData) {
    const payload = {
      ...formData,
      formID,
    };

    // the api route that tries logging into the form
    const url = "/api/form/login";

    const results = await Fetcher.post(url, payload);

    const { location, form } = await results.json();

    // check for errors in the response
    if (results.status !== 200) {
      // display some kind of alert with the errors
      console.log(`Error: ${results.status}`);
      return;
    }

    // else,
    // store the form document and location
    // document in some global state (Zustand or Redux)

    formStore.setLocation(location);
    formStore.setForm(form);

    // TODO - Load shifts, inventory, and violations from Fauna into formStore.

    const dataURL = process.env.NEXT_PUBLIC_URL + "api/form/get-location-data";
    const dataRes = await Fetcher.get(`${dataURL}?locationID=${location.id}`);

    const { inventory, shifts, violations } = await dataRes.json();

    formStore.setInventory(inventory);
    formStore.setShifts(shifts);
    formStore.setViolations(violations);

    router.replace(`${process.env.NEXT_PUBLIC_URL}form/${formID}/meta/`);
  }

  return (
    <div className="container-fluid screen-container">
      {/* <h3>FORM — {formID}</h3> */}
      <div className="row align-items-center">
        <div className="col-12">
          <div className="card">
            <form className="card-body" onSubmit={handleSubmit(loginToForm)}>
              <h3 className="mb-4">Label Guard</h3>
              <h4 className="mb-4">Sign In</h4>
              <TextInput
                form={loginForm}
                id={"form-password"}
                title={"Form Password"}
                type="password"
                options={{ required: "required" }}
              />
              <div className="d-grid">
                <SubmitButton text={"Sign In"} />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
