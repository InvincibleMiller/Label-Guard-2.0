"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Fetcher } from "@/util/fetchHelpers";

import {
  TextInput,
  TextAreaInput,
  SubmitButton,
} from "@/components/FormFields";
import EditButton from "@/components/EditButton";

// this is the dashboard route via which
// the admin can create label check forms for their restaurant
export default function page() {
  const form = useForm();
  const { reset: resetForm, handleSubmit } = form;
  // State for the form list
  const [locationForms, setLocationForms] = useState([]);

  // get a list of all the current forms for this location
  async function updateFormsList() {
    try {
      const res = await Fetcher.get(
        process.env.NEXT_PUBLIC_URL + "api/auth/get-forms"
      );

      const { data: forms } = await res.json();

      setLocationForms(forms);
    } catch (error) {
      console.error(error);
    }
  }

  async function registerForm(payload) {
    const url = "/api/auth/register-form";

    const result = await Fetcher.post(url, payload);

    if (result.status !== 200) {
      const body = await result.json();
      console.log(`${result.status}: ${body.message}`);
      return;
    }

    updateFormsList();
    resetForm();
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
      <form onSubmit={handleSubmit(registerForm)}>
        <TextInput
          id="form-name"
          title="Form Name"
          form={form}
          type="text"
          placeHolder="Some Restaurant"
          options={{ required: "required" }}
        />
        <TextAreaInput
          id="form-description"
          title="Form Description"
          form={form}
          placeHolder="A brief description of the form, 80 chars max."
          options={{ required: "required", maxLength: 80 }}
        />
        <TextInput
          id="form-password"
          title="Form Password"
          form={form}
          type="password"
          options={{ required: "required" }}
        />
        <TextInput
          id="form-confirm"
          title="Confirm Password"
          form={form}
          type="password"
          options={{ required: "required" }}
        />
        <SubmitButton text="Register Form" />
      </form>
      {locationForms?.length > 0 || "NO FORMS REGISTERED"}
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {locationForms?.map((form) => {
            return (
              <tr key={form.id}>
                <td>
                  <a
                    className="btn btn-link"
                    href={`${process.env.NEXT_PUBLIC_URL}form/${
                      form?.id || "NULL"
                    }`}
                    target="_blank"
                  >
                    {form?.name || "NULL"}
                  </a>
                </td>
                <td>
                  <EditButton
                    url={`${process.env.NEXT_PUBLIC_URL}/auth/dashboard/edit/${form.id}/forms`}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
