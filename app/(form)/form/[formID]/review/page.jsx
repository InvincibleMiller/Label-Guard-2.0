"use client";

import { useRouter } from "next/navigation";

// import form state
import useStore from "@/app/{stores}/useStore";
import useFormStore from "@/app/{stores}/formStore";

import { FindingListComponent } from "../findings/page";

import { Card } from "@/components/Bootstrap";
import Link from "next/link";

import moment from "moment";

import { Fetcher } from "@/util/fetchHelpers";

import FormLoadingScreen from "@/components/FormLoadingScreen";

function page({ params }) {
  const { formID } = params;
  const router = useRouter();

  const formDocument = useStore(useFormStore, (state) => state.form);
  const locationDocument = useStore(useFormStore, (state) => state.location);

  const submissionFullName = useStore(
    useFormStore,
    (state) => state.submissionFullName
  );
  const submissionDate = useStore(
    useFormStore,
    (state) => state.submissionDate
  );
  const submissionShift = useStore(
    useFormStore,
    (state) => state.submissionShift
  );

  const submissionFindings = useStore(
    useFormStore,
    (state) => state.submissionFindings
  );

  const clearFormState = useFormStore((state) => state.clearState);

  async function submitReport() {
    const payload = {
      fullName: submissionFullName,
      shift: submissionShift,
      date: submissionDate,
      findings: submissionFindings,
      location: locationDocument,
      form: formDocument,
    };

    const url = process.env.NEXT_PUBLIC_URL + "api/form/submit-finding-report";

    const res = await Fetcher.post(url, payload);

    if (res.status === 200) {
      clearFormState();

      router.push(process.env.NEXT_PUBLIC_URL + "form/success");
    } else {
      // TODO - Some kind of error effect
      router.push(process.env.NEXT_PUBLIC_URL + "form/error");
    }
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
            <h2>Review Finding Report</h2>
            <div className="d-grid">
              <button onClick={submitReport} className="btn btn-primary">
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="row mb-4">
        <div className="col">
          <h3>Shift Data</h3>
          <div className="d-flex flex-column gap-3">
            <Card title={"Full Name"}>
              <p className="card-text mb-0">
                {submissionFullName || "FULL NAME"}
              </p>
            </Card>
            <Card title={"Date"}>
              <p className="card-text mb-0">
                {moment(submissionDate).format("MMMM Do YYYY") || "DATE"}
              </p>
            </Card>
            <Card title={"Shift"}>
              <p className="card-text mb-0">
                {submissionShift?.name || "SHIFT"}
              </p>
            </Card>
          </div>
        </div>
      </div>
      <div className="row mb-4">
        <div className="col">
          <div className="d-flex justify-content-between mb-2">
            <h2 className="mb-0">Findings</h2>
            <Link href="findings" replace className="btn btn-secondary">
              Edit
            </Link>
          </div>
          <FindingListComponent />
        </div>
      </div>
    </div>
  );
}

export default page;
