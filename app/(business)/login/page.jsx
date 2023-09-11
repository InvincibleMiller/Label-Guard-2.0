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
    <div className="container screen-container">
      <form
        className="row w-100 justify-content-center align-items-center"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="col col-lg-6 card">
          <div className="card-body">
            <h4 className="mb-4 text-center">Login</h4>
            <TextInput
              id="email"
              title="Email"
              form={form}
              placeHolder="somebody@email.com"
              options={{ required: "required" }}
            />
            <TextInput
              id="password"
              title="Password"
              type="password"
              form={form}
              placeHolder=""
              options={{ required: "required" }}
            />
            <div className="text-center">
              <button className="btn btn-primary" type="submit">
                Login
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
