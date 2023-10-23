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
import { Pie, Bar, Doughnut } from "react-chartjs-2";

import SquareLoader from "@/components/SquareLoader";

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

  const chartColors = [
    "rgb(255, 99, 132)",
    "rgb(54, 162, 235)",
    "rgb(255, 206, 86)",
    "rgb(75, 192, 192)",
    "rgb(153, 102, 255)",
    "rgb(255, 159, 64)",
  ];
  const datasetGenerics = {
    backgroundColor: chartColors,
    borderColor: ["#fff"],
    borderWidth: 2,
  };

  const [reportData, setReportData] = useState({});

  //
  // Here we compile all the data fetched from the backend into
  // a format useable by ChartJS' API, and also for the blurbs.
  //

  // Estimated finding stats
  const shiftPieData = useMemo(() => {
    if (!reportData.reportProfile) {
      return {
        labels: [],
        datasets: [],
      };
    }

    return {
      labels: Lo.keys(reportData.shiftProfiles),
      datasets: [
        {
          label: " Findings",
          data: Lo.map(
            reportData.shiftProfiles,
            ({ occurrences, repeatOccurrences }, key) => {
              const stats = reportData.findingReportsPerShift[key];
              if (!stats) {
                return 0;
              }

              return Lo.round(
                (occurrences + repeatOccurrences) / stats.daily,
                2
              );
            }
          ),
          ...datasetGenerics,
        },
      ],
    };
  }, [reportData]);
  const shiftContributionStats = useMemo(() => {
    return Lo.map(
      reportData.shiftProfiles,
      ({ occurrences, repeatOccurrences }, key) => {
        const stats = reportData.findingReportsPerShift[key];
        if (!stats) {
          return {
            name: key,
            contribution: 0,
          };
        }

        return {
          name: key,
          contribution: Lo.round(
            (occurrences + repeatOccurrences) / stats.daily,
            2
          ),
        };
      }
    ).sort((a, b) => b.contribution - a.contribution);
  }, [reportData]);

  // Rate of completion of minimum required reports
  const shiftCompletionData = useMemo(() => {
    if (!reportData.reportProfile) {
      return {
        labels: [],
        datasets: [],
      };
    }

    return {
      labels: Lo.keys(reportData.shiftProfiles),
      datasets: [
        {
          yAxisID: "yAxis",
          label: " Daily Completion Rate",
          data: Lo.map(reportData.shiftProfiles, ({ value }, key) => {
            const calc = reportData.findingReportsPerShift[key];
            if (!calc) {
              return 0;
            }

            return calc.daily * 100;
          }),
          ...datasetGenerics,
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

  // Repeats vs regular findings
  const repeatComparisonData = useMemo(() => {
    if (!reportData.reportProfile) {
      return {
        labels: [],
        datasets: [],
      };
    }

    return {
      labels: ["Repeats", "Non-Repeats"],
      datasets: [
        {
          data: [
            reportData.reportProfile.repeatFindings,
            reportData.reportProfile.findings,
          ],
          ...datasetGenerics,
          backgroundColor: ["rgb(255, 99, 132)", "#e3e3e3"],
        },
      ],
    };
  }, [reportData]);

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
            <h4 className="chart-title">Estimated Contributions</h4>
            {Lo.isEmpty(reportData) ? (
              <>
                <SquareLoader />
              </>
            ) : (
              <>
                <Doughnut data={shiftPieData} />
              </>
            )}
          </div>
          <p className="lead">
            The top contributors to the overall score (by trend).
          </p>
          <p>
            Estimating the largest growth opportunities by shift by factoring in
            missing reports.
          </p>
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
            <Bar
              options={{
                callbacks: {
                  label: (tooltipItem, data) => {
                    //get the concerned dataset
                    var dataset = data.datasets[tooltipItem.datasetIndex];
                    //get the current items value
                    var currentValue = dataset.data[tooltipItem.index];

                    // console.log(currentValue);

                    return currentValue + "%";
                  },
                },
                scales: {
                  yAxis: {
                    ticks: {
                      min: 0,
                      max: 100,
                      callback: (value) => value + "%",
                    },
                    scaleLabel: {
                      display: true,
                      labelString: "Percentage",
                    },
                  },
                },
              }}
              data={shiftCompletionData}
            />
          </div>
          <p className="lead">
            Shifts completing the required minimum of finding reports.
          </p>
          <p>
            Missed finding reports result in inaccurate scoring. Strive to
            complete all minimum reports to raise accuracy.
          </p>
          <ol>
            {shiftCompletionStats.map((stats, i) => (
              <li key={i}>
                {stats.name}: {Lo.round(stats.score, 2)}% (missed{" "}
                {Lo.round(100 - stats.score, 2)}%)
              </li>
            ))}
          </ol>
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <div className="chart-container mb-4">
            <h4 className="chart-title">Repeat Ratio</h4>
            {Lo.isEmpty(reportData) ? (
              <>
                <SquareLoader />
              </>
            ) : (
              <>
                <Doughnut data={repeatComparisonData} />
              </>
            )}
          </div>
          <p className="lead">The portion of findings classified as repeats.</p>
          <p>
            This metric is indicative of the focus and awareness of the team in
            resolving longstanding, recurring issues.
          </p>
        </div>
      </div>
    </div>
  );
}
