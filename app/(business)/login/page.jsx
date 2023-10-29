"use client";

import { Fetcher } from "@/util/fetchHelpers";
import { useForm } from "react-hook-form";
import { TextInput } from "@/components/FormFields";
import { useState } from "react";

export default function page() {
  const form = useForm();
  const { handleSubmit, setError } = form;

  const [message, setMessage] = useState("");

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
          setMessage(json.message);
          setError("email", "invalid", { shouldFocus: true });
          setError("password", "invalid", { shouldFocus: true });

          setTimeout(() => {
            setMessage("");
          }, 3000);
        }
      });
  }

  return (
    <div className="container screen-container">
      <div className="row w-100 justify-content-center align-items-center">
        <div className="col col-lg-6 card">
          <div className="card-body">
            <form onSubmit={handleSubmit(onSubmit)}>
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
            </form>
            {message.length > 0 && (
              <div
                className="alert alert-danger position-absolute start-0 end-0 mt-4"
                role="alert"
              >
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
