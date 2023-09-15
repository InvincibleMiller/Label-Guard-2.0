"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Fetcher } from "@/util/fetchHelpers";

import { TextInput, NumberInput, SubmitButton } from "@/components/FormFields";
import EditButton from "@/components/EditButton";

export default function page() {
  const form = useForm();
  const { reset: resetForm, handleSubmit } = form;

  const [locationShifts, setLocationShifts] = useState([]);

  async function updateShiftList() {
    // pull all the shifts from Fauna DB and update state to match
    try {
      const url = process.env.NEXT_PUBLIC_URL + "api/auth/get-shifts";

      const results = await Fetcher.get(url);

      const { data: shifts } = await results.json();

      setLocationShifts(shifts);
      resetForm();
    } catch (error) {
      console.error(error);
    }
  }

  async function registerShift(payload) {
    // send payload to backend to add the product to Fauna DB
    // update the product list on success
    try {
      const url = "/api/auth/register-shift";
      const results = await Fetcher.post(url, payload);
      updateShiftList();
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    (async () => {
      await updateShiftList();
    })();
  }, []);

  return (
    <div>
      <h3>SHIFTS</h3>
      <form onSubmit={handleSubmit(registerShift)}>
        <TextInput
          id="shift-name"
          title="Shift Name"
          form={form}
          type="text"
          placeHolder="Some Shift"
          options={{ required: "required" }}
        />
        <NumberInput
          id="shift-minimum"
          title="Shift Minimum"
          form={form}
          options={{ required: "required" }}
        />
        <SubmitButton text="Register Shift" />
      </form>
      {locationShifts?.length > 0 || "NO SHIFTS REGISTERED"}
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Minimum</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {locationShifts?.map((shift) => {
            return (
              <tr key={shift.id}>
                <td>{shift.name || "NULL"}</td>
                <td>{shift.minimum || "NULL"}</td>
                <td>
                  <EditButton
                    url={`${process.env.NEXT_PUBLIC_URL}/auth/dashboard/edit/${shift.id}/shifts`}
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
