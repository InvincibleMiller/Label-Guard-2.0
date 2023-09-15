"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import {
  TextInput,
  TextAreaInput,
  SubmitButton,
} from "@/components/FormFields";

import { Fetcher } from "@/util/fetchHelpers";

export default function page({ params }) {
  const router = useRouter();

  const { documentID } = params;

  const updateForm = useForm();
  const { handleSubmit, setValue } = updateForm;

  async function updateFormDocument(payload) {
    const res = await Fetcher.post("/api/auth/update-form", {
      id: documentID,
      type: "forms",
      ...payload,
    });

    router.push("/auth/dashboard/forms");
  }

  async function deleteForm(e) {
    e.preventDefault();

    // call the delete trigger
    const res = await Fetcher.post("/api/auth/delete-document", {
      id: documentID,
      type: "forms",
    });

    router.push("/auth/dashboard/forms");
  }

  useEffect(() => {
    (async () => {
      const url =
        process.env.NEXT_PUBLIC_URL + `api/auth/edit/${documentID}/forms`;

      const response = await fetch(url, {
        method: "GET",
        credentials: "same-origin",
      });

      const { description, name } = await response.json();

      setValue("description", description);
      setValue("name", name);
    })();
  }, []);

  return (
    <div>
      <form onSubmit={handleSubmit(updateFormDocument)} className="mb-3">
        <TextInput
          id="name"
          title="Form Name"
          form={updateForm}
          type="text"
          placeHolder="Restaurant Form"
          options={{ required: "required" }}
        />
        <TextAreaInput
          id="description"
          title="Form Description"
          placeHolder="A brief description of this form"
          form={updateForm}
          options={{ required: "required", maxLength: 80 }}
          rows={2}
        />
        <SubmitButton text={"Update Form"} />
      </form>
      <form onSubmit={deleteForm}>
        <SubmitButton text="Delete Form" className={"btn btn-danger"} />
      </form>
    </div>
  );
}
