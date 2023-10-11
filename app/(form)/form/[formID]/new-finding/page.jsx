"use client";

// load form state from session storage
import useStore from "@/app/{stores}/useStore";
import useFormStore from "@/app/{stores}/formStore";

import { useForm } from "react-hook-form";

// import form components
import {
  SelectInput,
  TextAreaInput,
  SubmitButton,
} from "@/components/FormFields";

import { useRouter } from "next/navigation";

import Link from "next/link";
import FormLoadingScreen from "@/components/FormLoadingScreen";

function page({ params }) {
  const { formID } = params;
  const router = useRouter();

  const findingForm = useForm();
  const {
    handleSubmit,
    reset: resetForm,
    setError: setFormError,
  } = findingForm;

  // form state:

  const formDocument = useStore(useFormStore, (state) => state.form);

  const locationViolations = useStore(
    useFormStore,
    (state) => state.violations
  );

  const locationInventory = useStore(useFormStore, (state) => state.inventory);

  const addSubFinding = useFormStore((state) => state.addSubFinding);

  function addViolation(data) {
    const { violation, product, corrective } = data;

    //
    // client side input validation
    //

    if (violation == 0) {
      setFormError("violation", { message: "required" });
      return;
    }

    if (product == 0) {
      setFormError("product", { message: "required" });
      return;
    }

    // add the finding data to the form state
    const newFinding = {
      violation: JSON.parse(violation),
      product: JSON.parse(product),
      corrective,
    };

    addSubFinding(newFinding);

    // return to the finding list
    router.replace("findings");
  }

  if (!formDocument) {
    return <FormLoadingScreen formID={formID} />;
  }

  return (
    <div className="container-fluid">
      <div className="row sticky-header bg-white mb-4 shadow-sm py-4">
        <div className="container">
          <div className="row">
            <p className="lead mb-0">{formDocument?.name || "NULL"}</p>
            <div className="d-flex justify-content-between">
              <h2 className="mb-0">New Finding</h2>
              <Link href="findings" replace className="btn btn-secondary">
                Back
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <form onSubmit={handleSubmit(addViolation)}>
          <SelectInput
            id="violation"
            title={"Violation Type"}
            form={findingForm}
            options={{ required: "required" }}
          >
            {locationViolations?.length > 0 ? (
              <>
                <option disabled value={0}>
                  Select Violation
                </option>
                {locationViolations?.map((violation, i) => (
                  <option key={i} value={JSON.stringify(violation)}>
                    {violation?.name || "NULL"}
                  </option>
                )) || "NULL"}
              </>
            ) : (
              <>
                <option value="null">NULL</option>
              </>
            )}
          </SelectInput>
          <SelectInput
            id="product"
            title={"Product"}
            form={findingForm}
            options={{ required: "required" }}
          >
            {locationInventory?.length > 0 ? (
              <>
                <option disabled value={0}>
                  Select Product
                </option>
                {locationInventory?.map((product, i) => (
                  <option key={i} value={JSON.stringify(product)}>
                    {product?.name || i}
                  </option>
                )) || "NULL"}
              </>
            ) : (
              <>
                <option value="null">NULL</option>
              </>
            )}
          </SelectInput>
          <TextAreaInput
            id={"corrective"}
            title={"Corrective Action"}
            form={findingForm}
            options={{ maxLength: 80, required: "required" }}
            rows={3}
          />
          <div className="d-grid">
            <SubmitButton text={"Add Finding"} />
          </div>
        </form>
      </div>
    </div>
  );
}

export default page;
