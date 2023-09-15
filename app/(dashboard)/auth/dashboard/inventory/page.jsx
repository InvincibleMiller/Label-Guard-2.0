"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Fetcher } from "@/util/fetchHelpers";

import { TextInput, SubmitButton } from "@/components/FormFields";
import EditButton from "@/components/EditButton";

export default function page() {
  const form = useForm();
  const { reset: resetForm, handleSubmit } = form;

  const [locationProducts, setLocationProducts] = useState([]);

  async function updateInventory() {
    try {
      const url = process.env.NEXT_PUBLIC_URL + "api/auth/get-inventory";

      const results = await Fetcher.get(url);

      const { data: products } = await results.json();

      setLocationProducts(products);
      resetForm();
    } catch (error) {
      console.error(error);
    }
  }

  async function registerProduct(payload) {
    try {
      const url = process.env.NEXT_PUBLIC_URL + "api/auth/register-product";

      const results = await Fetcher.post(url, payload);

      updateInventory();
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    (async () => {
      await updateInventory();
    })();
  }, []);

  return (
    <div>
      <h3>INVENTORY</h3>
      <form onSubmit={handleSubmit(registerProduct)}>
        <TextInput
          id="product-name"
          title="Product Name"
          form={form}
          type="text"
          placeHolder="Some Product"
          options={{ required: "required" }}
        />
        <SubmitButton text={"Register Product"} />
      </form>
      {locationProducts?.length > 0 || "NO PRODUCTS REGISTERED"}
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {locationProducts?.map((product) => {
            return (
              <tr key={product.id}>
                <td>{product.name || "NULL"}</td>
                <td>
                  <EditButton
                    url={`${process.env.NEXT_PUBLIC_URL}/auth/dashboard/edit/${product.id}/inventory`}
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
