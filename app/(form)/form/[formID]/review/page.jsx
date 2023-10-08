"use client";

// import form state
import useStore from "@/app/{stores}/useStore";
import useFormStore from "@/app/{stores}/formStore";

import { getFindingListComponent } from "../findings/page";

import { Card } from "@/components/Bootstrap";
import Link from "next/link";

import moment from "moment";

function page() {
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

  return (
    <div className="container-fluid">
      <div className="row sticky-header bg-white mb-4 shadow-sm py-4">
        <div className="container">
          <div className="row">
            <p className="lead mb-0">{formDocument?.name || "NULL"}</p>
            <h2>Review Finding Report</h2>
            <div className="d-grid">
              <Link href={"#"} className="btn btn-primary">
                Submit
              </Link>
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
          <h2>Findings</h2>
          {getFindingListComponent()}
        </div>
      </div>
    </div>
  );
}

export default page;
