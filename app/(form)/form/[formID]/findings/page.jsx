"use client";

import Link from "next/link";

// import form state
import useFormStore from "@/app/{stores}/formStore";

import useStore from "@/app/{stores}/useStore";

export default function page() {
  const formDocument = useStore(useFormStore, (state) => state.form);
  const locationDocument = useStore(useFormStore, (state) => state.location);

  const submissionFindings = useStore(
    useFormStore,
    (state) => state.submissionFindings
  );

  return (
    <div className="container-fluid">
      <div className="row sticky-header">
        <div className="container my-2">
          <div className="row">
            <h6>{formDocument?.name || "NULL"}</h6>
          </div>
          <div className="row">
            <div className="col-8">
              <h2>Findings</h2>
            </div>
            <div className="col-4 d-grid">
              <Link href="new-finding" className="btn btn-primary">
                Add New
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <ul>
            {submissionFindings?.map((finding, i) => (
              <li key={i}>{i + 1}</li>
            )) || "NO FINDINGS"}
          </ul>
        </div>
      </div>
    </div>
  );
}
