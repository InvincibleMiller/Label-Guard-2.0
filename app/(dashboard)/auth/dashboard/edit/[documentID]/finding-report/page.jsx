"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import {
  TextInput,
  TextAreaInput,
  SubmitButton,
} from "@/components/FormFields";

import { Fetcher } from "@/util/fetchHelpers";

import { Card } from "@/components/Bootstrap";

function page({ params }) {
  const router = useRouter();
  const { documentID } = params;

  const [findingList, setFindingList] = useState([]);

  async function deleteFindingReport(e) {
    const url = `${process.env.NEXT_PUBLIC_URL}api/auth/delete-finding-report`;

    const results = await Fetcher.post(url, {
      documentID,
    });

    router.push(`${process.env.NEXT_PUBLIC_URL}auth/dashboard/`);
  }

  useEffect(() => {
    (async () => {
      const url = `${process.env.NEXT_PUBLIC_URL}api/auth/get-violation-pairs?documentID=${documentID}`;

      const violationPairListRes = await Fetcher.get(url);

      const violationPairList = await violationPairListRes.json();

      setFindingList(violationPairList);
    })();
  }, []);

  return (
    <div>
      <div>EDITING FINDING REPORT: {documentID}</div>
      <Card className="mb-4">
        <ul className="list-group finding-list gap-3">
          {findingList?.map((finding, i) => {
            return (
              <ViolationPairCard key={i} index={i} violationPair={finding} />
            );
          })}
        </ul>
      </Card>
      <form onSubmit={deleteFindingReport}>
        <SubmitButton
          text="Delete Finding Report"
          className={"btn btn-danger"}
        />
      </form>
    </div>
  );
}

function ViolationPairCard({ violationPair, index }) {
  const id = `vp_${index}${
    violationPair.violation_id + violationPair.product_id
  }`;
  return (
    <Card title={`${violationPair.violation_id} ${violationPair.product_id}`}>
      <div className="accordion">
        <div className="accordion-item">
          <h2 className="accordion-header">
            <button
              className="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target={`#${id}`}
              aria-expanded="false"
              aria-controls={id}
            >
              Corrective
            </button>
          </h2>
          <div
            id={id}
            className="accordion-collapse collapse"
            data-bs-parent="#accordionExample"
          >
            <div className="accordion-body">{violationPair.corrective}</div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default page;
