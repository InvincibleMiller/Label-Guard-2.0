"use client";

import { Fetcher } from "@/util/fetchHelpers";
import { useForm } from "react-hook-form";
import { TextInput, TextAreaInput } from "@/components/FormFields";

export default function page() {
  const form = useForm();
  const { handleSubmit } = form;

  async function onSubmit(payload) {
    try {
      const session = await Fetcher.post(
        process.env.NEXT_PUBLIC_URL + "api/auth/register-location",
        payload
      );

      const { checkoutURL } = await session.json();

      window.location.href = checkoutURL;
    } catch (error) {
      console.error(error);
    }
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
