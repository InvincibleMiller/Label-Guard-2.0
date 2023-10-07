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

function page({ params }) {
  const router = useRouter();

  const { formID } = params;

  const metaForm = useForm();
  const { handleSubmit, reset: resetForm } = metaForm;

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

    setSubDate(submissionDate);
    setSubFullName(fullName);
    setSubShift(JSON.parse(shift));

    router.push(`${process.env.NEXT_PUBLIC_URL}form/${formID}/findings`);
    resetForm();
  }

  return (
    <div className="container-fluid">
      <div className="row ">
        <nav className="bg-primary text-white mb-4 navbar navbar-expand-lg">
          <div>
            <div className="container-fluid">
              <h2>{locationDocument?.name || "Label Guard"}</h2>
              <h6>{formDocument?.name || "Form Name"}</h6>
            </div>
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
                  <option value={null}>Select Shift</option>
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
