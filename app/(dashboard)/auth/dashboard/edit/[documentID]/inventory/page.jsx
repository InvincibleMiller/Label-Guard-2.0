"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { TextInput, SubmitButton } from "@/components/FormFields";

import { Fetcher } from "@/util/fetchHelpers";

export default function page({ params }) {
  const router = useRouter();

  const { documentID } = params;

  const updateForm = useForm();
  const { handleSubmit, setValue } = updateForm;

  async function updateProductDocument(payload) {
    try {
      const url = process.env.NEXT_PUBLIC_URL + "api/auth/update-product";
      const res = await Fetcher.post(url, {
        id: documentID,
        type: "products",
        ...payload,
      });

      router.push("/auth/dashboard/inventory");
    } catch (error) {
      console.error(error);
    }
  }

  async function deleteProductDocument(e) {
    e.preventDefault();

    // call the delete trigger
    const res = await Fetcher.post("/api/auth/delete-document", {
      id: documentID,
      type: "products",
    });

    router.push("/auth/dashboard/inventory");
  }

  useEffect(() => {
    (async () => {
      const url =
        process.env.NEXT_PUBLIC_URL + `api/auth/edit/${documentID}/products`;

      const response = await fetch(url, {
        method: "GET",
        credentials: "same-origin",
      });

      const { name } = await response.json();

      setValue("name", name);
    })();
  }, []);

  return (
    <div>
      <form onSubmit={handleSubmit(updateProductDocument)} className="mb-3">
        <TextInput
          id="name"
          title="Product Name"
          form={updateForm}
          type="text"
          placeHolder="Some Product"
          options={{ required: "required" }}
        />
        <SubmitButton text={"Update Product"} />
      </form>
      <form onSubmit={deleteProductDocument}>
        <SubmitButton text="Delete Product" className={"btn btn-danger"} />
      </form>
    </div>
  );
}
