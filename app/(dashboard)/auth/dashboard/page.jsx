"use client";

import { Fetcher } from "@/util/fetchHelpers";
import { useEffect, useRef, useState } from "react";

import { Card } from "@/components/Bootstrap";

import moment from "moment";

import Link from "next/link";

// this page should return a list of all the
// label checks for a location, and they should be editable
export default function page() {
  return (
    <div>
      <h3>FINDINGS</h3>
      <FindingPage />
    </div>
  );
}

function FindingPage() {
  const [findingPage, setFindingPage] = useState([]);
  const afterKey = useRef(undefined);

  const pageLimit = 25;

  async function loadPage(url) {
    const findingPageRes = await Fetcher.get(url);

    const { data: fetchedPage, after } = await findingPageRes.json();

    afterKey.current = after;
    setFindingPage((page) => [...page, ...fetchedPage]);
  }

  useEffect(() => {
    (async () => {
      const url =
        process.env.NEXT_PUBLIC_URL +
        `api/auth/get-finding-page?limit=${pageLimit}`;

      setFindingPage([]);
      await loadPage(url);
    })();
  }, []);

  function LoadNextPage(e) {
    if (afterKey.current === undefined || !afterKey.current) {
      return;
    }

    const url = `${process.env.NEXT_PUBLIC_URL}api/auth/get-next-page?pageSecret=${afterKey.current}`;

    loadPage(url);
  }

  return (
    <ul className="finding-list list-group gap-3">
      {findingPage?.map((findingReport, i) => {
        const date_str = moment(findingReport?.date.isoString).format(
          "MMMM Do YYYY"
        );

        const findingsLength = findingReport?.findings.length;

        return (
          <li key={i}>
            <Card
              title={
                <div className="d-flex justify-content-between align-items-center">
                  <p className="my-auto">{`${date_str} — ${findingReport?.full_name}`}</p>
                  <Link
                    className={"btn btn-secondary"}
                    href={`dashboard/edit/${findingReport?.id}/finding-report`}
                  >
                    Edit
                  </Link>
                </div>
              }
            >
              <p className="card-text">{`${findingsLength} finding${
                findingsLength > 1 ? "s" : ""
              }`}</p>
            </Card>
          </li>
        );
      }) || "NULL"}
      {afterKey.current != undefined && (
        <button
          onClick={LoadNextPage}
          type="button"
          className="btn btn-primary"
        >
          Load More
        </button>
      )}
    </ul>
  );
}
