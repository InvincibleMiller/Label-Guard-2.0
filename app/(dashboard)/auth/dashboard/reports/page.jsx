"use client";

import Lo from "lodash";
import moment from "moment";
import { Fetcher } from "@/util/fetchHelpers";

import { useState, useEffect, useMemo } from "react";

import { useForm } from "react-hook-form";
import { DateInput, SubmitButton } from "@/components/FormFields";

import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie } from "react-chartjs-2";
import { Bar } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function page() {
  const buildReportForm = useForm();
  const { handleSubmit } = buildReportForm;
  const [range, setRange] = useState(() => {
    let [from, to] = (() => {
      const firstOfMonth = moment();
      firstOfMonth.subtract(firstOfMonth.date() - 1, "days");

      const lastOfMonth = moment(firstOfMonth);
      lastOfMonth.add(1, "months");
      lastOfMonth.subtract(1, "days");

      return [firstOfMonth, lastOfMonth].map((date) =>
        moment(date).format("YYYY-MM-DD")
      );
    })();

    return { from, to };
  });

  const [reportData, setReportData] = useState({});
  const shiftPieData = useMemo(() => {
    return {
      labels: Lo.keys(reportData.shiftProfiles),
      datasets: [
        {
          label: " Occurrences",
          data: Lo.map(reportData.shiftProfiles, ({ totalWeight }, key) => {
            const stats = reportData.findingReportsPerShift[key];
            if (!stats) {
              return 0;
            }

            return Lo.round(totalWeight / stats.daily, 1);
          }),
          backgroundColor: [
            "rgb(255, 99, 132)",
            "rgb(54, 162, 235)",
            "rgb(255, 206, 86)",
            "rgb(75, 192, 192)",
            "rgb(153, 102, 255)",
            "rgb(255, 159, 64)",
          ],
          borderColor: ["#fff"],
          borderWidth: 2,
        },
      ],
    };
  }, [reportData]);
  const shiftContributionStats = useMemo(() => {
    return Lo.map(reportData.shiftProfiles, ({ totalWeight }, key) => {
      const stats = reportData.findingReportsPerShift[key];
      if (!stats) {
        return null;
      }

      return {
        name: key,
        contribution: Lo.round(totalWeight / stats.daily, 1),
      };
    })
      .filter((o) => o !== null)
      .sort((a, b) => b.contribution - a.contribution);
  }, [reportData]);

  const shiftCompletionData = useMemo(() => {
    return {
      labels: Lo.keys(reportData.shiftProfiles),
      datasets: [
        {
          label: "Daily Completion Rate",
          data: Lo.map(reportData.shiftProfiles, ({ value }, key) => {
            const calc = reportData.findingReportsPerShift[key];
            if (!calc) {
              return 0;
            }

            return calc.daily * 100;
          }),
          backgroundColor: [
            "rgb(255, 99, 132)",
            "rgb(255, 159, 64)",
            "rgb(255, 205, 86)",
            "rgb(75, 192, 192)",
            "rgb(54, 162, 235)",
            "rgb(153, 102, 255)",
            "rgb(201, 203, 207)",
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [reportData]);
  const shiftCompletionStats = useMemo(
    () =>
      Lo.map(reportData.shiftProfiles, ({ value }, key) => {
        const calc = reportData.findingReportsPerShift[key];
        if (!calc) {
          return { name: key, score: 0 };
        }

        return { name: key, score: calc.daily * 100 };
      }).sort((a, b) => b.score - a.score),
    [reportData]
  );

  useEffect(() => {
    (async () => {
      const url = `${
        process.env.NEXT_PUBLIC_URL
      }api/auth/get-full-report${Fetcher.toQueryParams(range)}`;

      const result = await Fetcher.get(url);

      const data = await result.json();

      setReportData(data);
    })();
  }, [range]);

  function buildReport(data) {
    setRange(data);
  }

  return (
    <div>
      <h3>REPORTS</h3>
      <form onSubmit={handleSubmit(buildReport)}>
        <div className="row mb-4 row-gap-3">
          <div className="col-12 col-md-4">
            <DateInput
              form={buildReportForm}
              title={"From"}
              id={"from"}
              defaultValue={range.from}
            />
          </div>
          <div className="col-12 col-md-4">
            <DateInput
              form={buildReportForm}
              title={"To"}
              id={"to"}
              defaultValue={range.to}
            />
          </div>
          <div className="col-12 col-md-4">
            <div className="d-grid h-100">
              <SubmitButton
                text={"Build Report"}
                className={"btn btn-primary h-100"}
              />
            </div>
          </div>
        </div>
      </form>
      <div className="row mb-4">
        <div className="col-12 col-md-6 col-lg-4">
          <div className="chart-container mb-4">
            <h4 className="chart-title">Contribution By Shift</h4>
            <Pie data={shiftPieData} title="Contribution by Shift" />
          </div>
          <p className="lead">The top contributors to score (by trend)</p>
          <ol>
            {shiftContributionStats.map((stats, i) => (
              <li key={i}>
                {stats.name}: {stats.contribution} points
              </li>
            ))}
          </ol>
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <div className="chart-container mb-4">
            <h4 className="chart-title">Daily Completion Rate</h4>
            <Bar data={shiftCompletionData} title="Contribution by Shift" />
          </div>
          <p className="lead">
            Rate of completion of minimum daily finding reports (by shift)
          </p>
          <ol>
            {shiftCompletionStats.map((stats, i) => (
              <li key={i}>
                {stats.name}: {Lo.round(stats.score, 2)}% points
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
