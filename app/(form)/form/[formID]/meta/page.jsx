"use client";

// import form state
import useFormStore from "@/app/{stores}/formStore";

import useStore from "@/app/{stores}/useStore";

import React from "react";

function page({ params }) {
  const { formID } = params;

  const locationDocument = useStore(useFormStore, (state) => state.location);
  const formDocument = useStore(useFormStore, (state) => state.form);

  return (
    <div className="container-fluid screen-container py-5">
      <p>{JSON.stringify(locationDocument)}</p>
      <p>{JSON.stringify(formDocument)}</p>
    </div>
  );
}

export default page;
