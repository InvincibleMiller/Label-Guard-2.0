"use client";

import { Fetcher } from "@/util/fetchHelpers";
import { useForm } from "react-hook-form";
import { TextInput } from "@/components/FormFields";

export default function page() {
  const form = useForm();
  const { handleSubmit } = form;

  function onSubmit(payload) {
    Fetcher.post(process.env.NEXT_PUBLIC_URL + "api/login", payload, {
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
          <TextInput
            id="email"
            title="Email"
            form={form}
            placeHolder="johndoe@gmail.com"
            options={{ required: "required" }}
          />
          <TextInput
            id="password"
            title="Password"
            type="password"
            form={form}
            options={{ required: "required" }}
          />
          <div className="text-center">
            <button className="btn btn-primary" type="submit">
              Login
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
