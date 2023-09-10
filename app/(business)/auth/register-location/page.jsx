"use client";

import { Fetcher } from "@/util/fetchHelpers";
import { useForm } from "react-hook-form";
import { TextInput, TextAreaInput } from "@/components/FormFields";

export default function page() {
  const form = useForm();
  const { handleSubmit } = form;

  function onSubmit(payload) {
    Fetcher.post(
      process.env.NEXT_PUBLIC_URL + "api/auth/register-location",
      payload,
      {
        Accept: "text/*",
      }
    )
      .then((res) => {
        if (res.redirected) {
          window.location.href = res.url;
        }

        return res.json();
      })
      .then((json) => {
        if (json.status !== 200) {
          console.error(`${json.status} : ${json.message}`);
        }
      });
  }

  return (
    <div className="container">
      <form className="row w-lg-50" onSubmit={handleSubmit(onSubmit)}>
        <div className="col">
          <TextInput
            id="name"
            title="Location Name"
            form={form}
            placeHolder="Some Restaurant"
            options={{ required: "required" }}
          />
          <TextAreaInput
            id="description"
            title="Description"
            form={form}
            options={{ required: "required", maxLength: 80 }}
          />
          <div className="text-center">
            <button className="btn btn-primary" type="submit">
              Continue
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
