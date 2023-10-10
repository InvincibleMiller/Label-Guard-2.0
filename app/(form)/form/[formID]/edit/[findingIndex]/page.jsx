"use client";

// load form state from session storage
import useStore from "@/app/{stores}/useStore";
import useFormStore from "@/app/{stores}/formStore";

import { useForm } from "react-hook-form";

// import form components
import { TextAreaInput, SubmitButton } from "@/components/FormFields";

import { useRouter } from "next/navigation";

import Link from "next/link";

import FormLoadingScreen from "@/components/FormLoadingScreen";

function page({ params }) {
  const router = useRouter();

  const { findingIndex, formID } = params;

  const findingForm = useForm();
  const { handleSubmit } = findingForm;

  // form state:

  const formDocument = useStore(useFormStore, (state) => state.form);

  const editSubFinding = useFormStore((state) => state.editSubFinding);

  const selectedFinding = useStore(
    useFormStore,
    (state) => state.submissionFindings[findingIndex]
  );

  function editViolation(data) {
    const { corrective } = data;

    // replace the finding data in form state
    const editedFinding = {
      violation: selectedFinding?.violation,
      product: selectedFinding?.product,
      corrective,
    };

    editSubFinding(findingIndex, editedFinding);

    // return to the finding list
    router.replace("../findings");
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
              <h2>Edit Finding</h2>
              <Link href="../findings" replace className="btn btn-secondary">
                Back
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <form onSubmit={handleSubmit(editViolation)}>
          <p className="lead mb-0">Editing</p>
          <h4>
            {selectedFinding?.violation?.name || "VIOLATION"}
            &nbsp;
            {selectedFinding?.product?.name || "PRODUCT"}
          </h4>
          {selectedFinding?.corrective && (
            <TextAreaInput
              id={"corrective"}
              title={"Corrective Action"}
              form={findingForm}
              options={{ maxLength: 80, required: "required" }}
              rows={3}
              defaultValue={selectedFinding?.corrective || "..."}
            />
          )}
          <div className="d-grid">
            <SubmitButton text={"Edit Finding"} />
          </div>
        </form>
      </div>
    </div>
  );
}

export default page;
