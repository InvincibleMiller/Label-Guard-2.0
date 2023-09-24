"use client";

// import form state
import useFormStore from "@/app/{stores}/formStore";

import { useForm } from "react-hook-form";
import { TextInput, SubmitButton } from "@/components/FormFields";

import { Fetcher } from "@/util/fetchHelpers";

import { useRouter } from "next/navigation";

export default function page({ params }) {
  const router = useRouter();

  const formStore = useFormStore();

  const { formID } = params;

  const loginForm = useForm();

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
    }

    // else,
    // store the form document and location
    // document in some global state (Zustand or Redux)

    formStore.setLocation(location);
    formStore.setForm(form);

    router.push(`${process.env.NEXT_PUBLIC_URL}form/${formID}/meta/`);
  }

  return (
    <div className="container-fluid screen-container py-5">
      {/* <h3>FORM — {formID}</h3> */}
      <div className="row align-items-center">
        <div className="col-12">
          <div className="card">
            <form
              className="card-body text-center"
              onSubmit={handleSubmit(loginToForm)}
            >
              <h4 className="mb-4 text-center">Sign In</h4>
              <TextInput
                form={loginForm}
                id={"form-password"}
                title={"Form Password"}
                type="password"
                options={{ required: "required" }}
              />
              <SubmitButton text={"Sign In"} />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
