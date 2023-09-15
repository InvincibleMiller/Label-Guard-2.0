"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { TextInput, NumberInput, SubmitButton } from "@/components/FormFields";

import { Fetcher } from "@/util/fetchHelpers";

function page({ params }) {
  const router = useRouter();

  const { documentID } = params;

  const updateForm = useForm();
  const { handleSubmit, setValue } = updateForm;

  async function updateShiftDocument(payload) {
    try {
      const url = process.env.NEXT_PUBLIC_URL + "/api/auth/update-shift";

      const result = await Fetcher.post(url, {
        id: documentID,
        type: "shifts",
        ...payload,
      });

      if (result.status != 200) {
        throw new Error("Error updating document");
      }

      router.push("/auth/dashboard/shifts");
    } catch (error) {
      console.error(error);
    }
  }
  async function deleteShiftDocument(e) {
    e.preventDefault();

    try {
      // call the delete trigger
      const result = await Fetcher.post("/api/auth/delete-document", {
        id: documentID,
        type: "shifts",
      });

      if (result.status != 200) {
        throw new Error("Error updating document");
      }

      router.push("/auth/dashboard/shifts");
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    (async () => {
      const url =
        process.env.NEXT_PUBLIC_URL + `api/auth/edit/${documentID}/shifts`;

      const result = await Fetcher.get(url);

      const { name, minimum } = await result.json();

      setValue("name", name);
      setValue("minimum", minimum);
    })();
  }, []);

  return (
    <div>
      <form onSubmit={handleSubmit(updateShiftDocument)} className="mb-3">
        <TextInput
          id="name"
          title="Shift Name"
          form={updateForm}
          type="text"
          placeHolder="Some Shift"
          options={{ required: "required" }}
        />
        <NumberInput
          id="minimum"
          title="Shift Minimum"
          form={updateForm}
          options={{ required: "required" }}
        />
        <SubmitButton text={"Update Shift"} />
      </form>
      <form onSubmit={deleteShiftDocument}>
        <SubmitButton text="Delete Form" className={"btn btn-danger"} />
      </form>
    </div>
  );
}

export default page;
