"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Fetcher } from "@/util/fetchHelpers";

import { TextInput, NumberInput, SubmitButton } from "@/components/FormFields";
import EditButton from "@/components/EditButton";

export default function page() {
  const form = useForm();
  const { reset: resetForm, handleSubmit } = form;

  const [locationViolations, setLocationViolations] = useState([]);

  async function updateViolationList() {
    try {
      const url = process.env.NEXT_PUBLIC_URL + "api/auth/get-violations";

      const results = await Fetcher.get(url);

      const { data: violations } = await results.json();

      setLocationViolations(violations);
      resetForm();
    } catch (error) {
      console.error(error);
    }
  }

  async function registerViolation(payload) {
    // send payload to backend to add the product to Fauna DB
    // update the violation list on success
    try {
      const url = process.env.NEXT_PUBLIC_URL + "api/auth/register-violation";
      const results = await Fetcher.post(url, payload);
      updateViolationList();
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    (async () => {
      await updateViolationList();
    })();
  }, []);

  return (
    <div>
      <h3>VIOLATIONS</h3>
      <form onSubmit={handleSubmit(registerViolation)}>
        <TextInput
          id="violation-name"
          title="Violation Name"
          form={form}
          type="text"
          placeHolder="Some Violation"
          options={{ required: "required" }}
        />
        <NumberInput
          id="violation-weight"
          title="Violation Weight"
          form={form}
          defaultValue="1"
          options={{ required: "required" }}
        />
        <NumberInput
          id="violation-repeat-weight"
          title="Repeat Weight"
          form={form}
          options={{ required: "required" }}
        />
        <SubmitButton text="Register Violation" />
      </form>
      {locationViolations?.length > 0 || "NO VIOLATIONS REGISTERED"}
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Weight</th>
            <th>Repeat Weight</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {locationViolations?.map((violation) => {
            return (
              <tr key={violation.id}>
                <td>{violation.name || "NULL"}</td>
                <td>
                  {violation.weight == undefined ? "NULL" : violation.weight}
                </td>
                <td>
                  {violation.repeat_weight == undefined
                    ? "NULL"
                    : violation.repeat_weight}
                </td>
                <td>
                  <EditButton
                    url={`${process.env.NEXT_PUBLIC_URL}/auth/dashboard/edit/${violation.id}/violations`}
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
