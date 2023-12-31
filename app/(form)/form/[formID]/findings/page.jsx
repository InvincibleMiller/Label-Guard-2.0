"use client";

import Link from "next/link";

// import form state
import useFormStore from "@/app/{stores}/formStore";

import useStore from "@/app/{stores}/useStore";

import { Card } from "@/components/Bootstrap";

import FormLoadingScreen from "@/components/FormLoadingScreen";

export default function page({ params }) {
  const { formID } = params;

  const formDocument = useStore(useFormStore, (state) => state.form);

  if (!formDocument) {
    return <FormLoadingScreen formID={formID} />;
  }

  return (
    <div className="container-fluid">
      <div className="row sticky-header bg-white mb-4 shadow-sm py-4">
        <div className="container">
          <div className="row">
            <p className="lead mb-0">{formDocument?.name || "NULL"}</p>
            <div className="col-12 d-flex justify-content-between">
              <h2 className="mb-0">Findings</h2>
              <Link replace href="new-finding" className="btn btn-primary mb-2">
                Add New
              </Link>
            </div>
            <div className="d-grid">
              <Link replace href={"review"} className="btn btn-primary">
                <h3 className="my-0">Continue</h3>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="row mb-4">
        <div className="col">
          <FindingListComponent />
        </div>
      </div>
    </div>
  );
}

export function FindingListComponent() {
  const submissionFindings = useStore(
    useFormStore,
    (state) => state.submissionFindings
  );

  const deleteSubFinding = useFormStore((state) => state.deleteSubFinding);

  return (
    <ul className="finding-list list-group gap-3">
      {submissionFindings
        ?.map((finding, i) => (
          <li key={i} className="">
            <Card>
              <div className="col-10 block mb-0">
                <div className="card-title">
                  <h5 className="d-inline">
                    {finding?.violation?.name || "Violation"}
                  </h5>
                  &nbsp;
                  <h5 className="d-inline">
                    {finding?.product?.name || "Product"}
                  </h5>
                </div>
                <p className="card-text">
                  {finding?.corrective || "Corrective"}
                </p>
              </div>
              <div className="col-2 d-grid justify-content-end">
                <div className="mx-auto dropdown">
                  <button
                    className="btn btn-outline-primary dropdown-toggle"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  ></button>
                  <ul className="dropdown-menu">
                    <li>
                      <Link
                        replace
                        href={`edit/${i}`}
                        className="dropdown-item"
                      >
                        Edit
                      </Link>
                    </li>
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => deleteSubFinding(i)}
                      >
                        Delete
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </li>
        ))
        .reverse() || "NO FINDINGS"}
    </ul>
  );
}
