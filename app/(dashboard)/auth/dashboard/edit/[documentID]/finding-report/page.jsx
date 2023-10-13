"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import {
  fetchLocationEverything,
  useDashboardStore,
} from "@/app/{stores}/dashboardStore";

import {
  SelectInput,
  TextAreaInput,
  TextInput,
  DateInput,
  SubmitButton,
} from "@/components/FormFields";

import { Fetcher } from "@/util/fetchHelpers";

import { Card } from "@/components/Bootstrap";
import { useStore } from "zustand";
import moment from "moment";

function page({ params }) {
  const router = useRouter();
  const { documentID } = params;

  const findingReportForm = useForm();
  const { handleSubmit } = findingReportForm;

  const [findingReport, setFindingReportDocument] = useState([]);

  const locationState = fetchLocationEverything();

  async function updateFindingReport(payload) {
    console.log(payload);
  }

  async function deleteFindingReport(e) {
    const url = `${process.env.NEXT_PUBLIC_URL}api/auth/delete-finding-report`;

    const results = await Fetcher.post(url, {
      documentID,
    });

    router.push(`${process.env.NEXT_PUBLIC_URL}auth/dashboard/`);
  }

  useEffect(() => {
    (async () => {
      const url = `${process.env.NEXT_PUBLIC_URL}api/auth/get-finding-report?documentID=${documentID}`;

      const findingReportRes = await Fetcher.get(url);

      const findingReportDoc = await findingReportRes.json();

      setFindingReportDocument(findingReportDoc);
    })();
  }, []);

  return (
    <div>
      <form onSubmit={handleSubmit(updateFindingReport)} className="mb-4">
        {findingReport?.full_name && (
          <TextInput
            title={"Full Name"}
            id={`full_name`}
            form={findingReportForm}
            defaultValue={findingReport?.full_name}
          />
        )}
        {findingReport?.date && (
          <DateInput
            form={findingReportForm}
            id={"date"}
            title={"Submission Date"}
            defaultValue={findingReport.date.isoString}
          />
        )}
        {findingReport?.findings?.map((finding, i) => (
          <Card title={`Finding ${i + 1}`} key={i} className="mb-4">
            <div className="container-fluid">
              {(locationState && (
                <div className="row gap-3">
                  <div className="col-12 col-md p-0">
                    <SelectInput
                      form={findingReportForm}
                      title={"Violation"}
                      id={`findings[${i}].violation_id`}
                      defaultValue={finding.violation_id}
                    >
                      {locationState.violations.map((violation, v_index) => {
                        return (
                          <option key={v_index} value={violation.id}>
                            {violation.name}
                          </option>
                        );
                      }) || (
                        <option value={finding.violation_id}>Violation</option>
                      )}
                    </SelectInput>
                  </div>
                  <div className="col-12 col-md p-0">
                    <SelectInput
                      form={findingReportForm}
                      title={"Product"}
                      id={`findings[${i}].product_id`}
                      defaultValue={finding.product_id}
                    >
                      {locationState.inventory.map((product, p_index) => {
                        return (
                          <option key={p_index} value={product.id}>
                            {product.name}
                          </option>
                        );
                      }) || (
                        <option value={finding.violation_id}>Product</option>
                      )}
                    </SelectInput>
                  </div>
                  <div className="col-12 p-0">
                    <TextAreaInput
                      title={"Corrective"}
                      form={findingReportForm}
                      id={`findings[${i}].corrective`}
                      defaultValue={finding.corrective}
                      rows={3}
                    />
                  </div>
                </div>
              )) ||
                "LOADING"}
            </div>
          </Card>
        )) || "LOADING"}
        <SubmitButton text={"Update Finding Report"} />
      </form>
      <form onSubmit={deleteFindingReport}>
        <SubmitButton
          text="Delete Finding Report"
          className={"btn btn-danger"}
        />
      </form>
    </div>
  );
}

export default page;
