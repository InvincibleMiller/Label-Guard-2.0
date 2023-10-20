"use client";

// import form state
import useFormStore from "@/app/{stores}/formStore";

import useStore from "@/app/{stores}/useStore";

import { useRouter } from "next/navigation";

import { useForm } from "react-hook-form";
import {
  SelectInput,
  TextInput,
  DateInput,
  SubmitButton,
} from "@/components/FormFields";

import FormLoadingScreen from "@/components/FormLoadingScreen";

function page({ params }) {
  const router = useRouter();

  const { formID } = params;

  const metaForm = useForm();
  const { handleSubmit, reset: resetForm, setError: setFormError } = metaForm;

  const locationDocument = useStore(useFormStore, (state) => state.location);
  const formDocument = useStore(useFormStore, (state) => state.form);
  const shifts = useStore(useFormStore, (state) => state.shifts);

  const setSubDate = useFormStore((state) => state.setSubDate);
  const setSubFullName = useFormStore((state) => state.setSubFullName);
  const setSubShift = useFormStore((state) => state.setSubShift);

  // after getting some metadata about the submission
  // store it in formStore state and move to the findings page
  function submitMetadata(payload) {
    // full-name : "",
    // shift : "JSON...",
    // submission-date : "2023-10-04"
    const {
      "full-name": fullName,
      shift,
      "submission-date": submissionDate,
    } = payload;

    console.log(payload);

    if (shift == 0) {
      setFormError("shift", { message: "required" }, { shouldFocus: true });
      return;
    }

    setSubDate(submissionDate);
    setSubFullName(fullName);
    setSubShift(JSON.parse(shift));

    router.replace(`${process.env.NEXT_PUBLIC_URL}form/${formID}/findings`);
  }

  if (!formDocument) {
    return <FormLoadingScreen formID={formID} />;
  }

  return (
    <div className="container-fluid">
      <div className="row sticky-header bg-white mb-4 shadow-sm py-4">
        <nav className="container">
          <div className="row">
            <p className="lead mb-0">{formDocument?.name || "Form Name"}</p>
            <h2 className="mb-0">{locationDocument?.name || "Label Guard"}</h2>
          </div>
        </nav>
      </div>
      <div className="row">
        <div className="col">
          <p className="lead">Let's get some data about this submission.</p>
          <form onSubmit={handleSubmit(submitMetadata)}>
            <DateInput
              id={"submission-date"}
              title={"Submission Date"}
              form={metaForm}
              options={{ required: "required" }}
            />
            <TextInput
              id={"full-name"}
              title={"Full Name"}
              form={metaForm}
              options={{ required: "required" }}
            />
            <SelectInput
              id={"shift"}
              title={"Shift"}
              form={metaForm}
              options={{ required: "required" }}
            >
              {shifts?.length > 0 ? (
                <>
                  <option disabled value={0}>
                    Select Shift
                  </option>
                  {shifts?.map((shift, i) => {
                    return (
                      <option key={i} value={JSON.stringify(shift)}>
                        {shift?.name || "NULL"}
                      </option>
                    );
                  })}
                </>
              ) : (
                <>
                  <option value="null">NULL</option>
                </>
              )}
            </SelectInput>
            <div className="d-grid">
              <SubmitButton text={"Next"} className={"btn btn-primary mt-4"} />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default page;
