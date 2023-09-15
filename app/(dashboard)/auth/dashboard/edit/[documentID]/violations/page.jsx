"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { TextInput, NumberInput, SubmitButton } from "@/components/FormFields";

import { Fetcher } from "@/util/fetchHelpers";

export default function page({ params }) {
  const router = useRouter();

  const { documentID } = params;

  const updateForm = useForm();
  const { handleSubmit, setValue } = updateForm;

  async function updateViolationDocument(payload) {
    try {
      const url = process.env.NEXT_PUBLIC_URL + "api/auth/update-violation";

      const res = await Fetcher.post(url, {
        id: documentID,
        type: "violations",
        ...payload,
      });

      router.push("/auth/dashboard/violations");
    } catch (error) {
      console.error(error);
    }
  }

  async function deleteViolationDocument(e) {
    e.preventDefault();

    // call the delete trigger
    const res = await Fetcher.post("/api/auth/delete-document", {
      id: documentID,
      type: "violations",
    });

    router.push("/auth/dashboard/violations");
  }

  useEffect(() => {
    // Fill in the form fields with the document data by default
    (async () => {
      const url =
        process.env.NEXT_PUBLIC_URL + `api/auth/edit/${documentID}/violations`;

      const response = await Fetcher.get(url);

      const { name, weight, repeat_weight } = await response.json();

      setValue("name", name);
      setValue("weight", weight);
      setValue("repeat_weight", repeat_weight);
    })();
  }, []);

  return (
    <div>
      <form onSubmit={handleSubmit(updateViolationDocument)} className="mb-3">
        <TextInput
          id="name"
          title="Violation Name"
          form={updateForm}
          type="text"
          placeHolder="Some Violation"
          options={{ required: "required" }}
        />
        <NumberInput
          id="weight"
          title="Violation Weight"
          form={updateForm}
          options={{ required: "required" }}
        />
        <NumberInput
          id="repeat_weight"
          title="Repeat Weight"
          form={updateForm}
          options={{ required: "required" }}
        />
        <SubmitButton text="Update Violation" />
      </form>
      <form onSubmit={deleteViolationDocument}>
        <SubmitButton text="Delete Violation" className={"btn btn-danger"} />
      </form>
    </div>
  );
}
