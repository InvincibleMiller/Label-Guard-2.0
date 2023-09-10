"use client";

import { Fetcher } from "@/util/fetchHelpers";
import { useForm } from "react-hook-form";
import { TextInput } from "@/components/FormFields";

export default function page() {
  const form = useForm();
  const { handleSubmit } = form;

  function onSubmit(payload) {
    Fetcher.post(process.env.NEXT_PUBLIC_URL + "api/register", payload, {
      Accept: "text/*",
    })
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
          <div className="row">
            <div className="col">
              <TextInput
                id="first-name"
                title="First Name"
                type="text"
                form={form}
                options={{ required: "required" }}
              />
            </div>
            <div className="col">
              <TextInput
                id="last-name"
                title="Last Name"
                type="text"
                form={form}
                options={{ required: "required" }}
              />
            </div>
          </div>
          <TextInput
            id="email"
            title="Email"
            form={form}
            placeHolder="johndoe@gmail.com"
            options={{ required: "required" }}
          />
          <div className="row">
            <div className="col">
              <TextInput
                id="password"
                title="Password"
                type="password"
                form={form}
                options={{ required: "required" }}
              />
            </div>
            <div className="col">
              <TextInput
                id="confirm"
                title="Confirm Password"
                type="password"
                form={form}
                options={{ required: "required" }}
              />
            </div>
          </div>
          <div className="text-center">
            <button className="btn btn-primary" type="submit">
              Sign Up
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
