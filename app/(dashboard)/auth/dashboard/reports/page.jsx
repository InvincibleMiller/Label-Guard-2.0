"use client";

import Lo from "lodash";
import moment from "moment";
import { Fetcher } from "@/util/fetchHelpers";

import { useState, useEffect, useMemo } from "react";

import { useForm } from "react-hook-form";
import { DateInput, SubmitButton } from "@/components/FormFields";

import { GradientChart } from "@/components/Charts";

import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie, Bar, Doughnut } from "react-chartjs-2";

import SquareLoader from "@/components/SquareLoader";

ChartJS.register(ArcElement, Tooltip, Legend);
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

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
  const calendarGradient = [
    "rgb(54, 162, 235)",
    "rgb(75, 192, 192)",
    "rgb(153, 102, 255)",
    "rgb(255, 99, 132)",
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
          data: Lo.map(reportData.shiftProfiles, ({ occurrences }, key) => {
            const stats = reportData.findingReportsPerShift[key];
            if (!stats) {
              return 0;
            }

            return Lo.round(occurrences / stats.daily, 2);
          }),
          ...datasetGenerics,
        },
      ],
    };
  }, [reportData]);
  const shiftContributionStats = useMemo(() => {
    return Lo.map(reportData.shiftProfiles, ({ occurrences }, key) => {
      const stats = reportData.findingReportsPerShift[key];
      if (!stats) {
        return {
          name: key,
          contribution: "lacks data",
        };
      }

      return {
        name: key,
        contribution: Lo.round(occurrences / stats.daily, 2),
      };
    }).sort((a, b) => b.contribution - a.contribution);
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
      Lo.map(reportData.shiftProfiles, (value, key) => {
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
            reportData.reportProfile.nonRepeatFindings,
          ],
          ...datasetGenerics,
          backgroundColor: ["rgb(255, 99, 132)", "#e3e3e3"],
        },
      ],
    };
  }, [reportData]);
  const repeatRatio = useMemo(() => {
    if (!reportData.reportProfile) {
      return 0;
    }

    return Lo.round(
      (reportData.reportProfile.repeatFindings /
        reportData.reportProfile.findings) *
        100,
      2
    );
  }, [reportData]);

  // Heat map calendar data
  const calendarData = useMemo(() => {
    if (!reportData.reportProfile) {
      return {
        labels: [],
        datasets: [],
      };
    }

    return {
      labels: Lo.map(reportData.weightedByDate, ({ date }) => date),
      datasets: [
        {
          label: "points",
          data: Lo.map(reportData.weightedByDate, ({ weight }) => weight),
        },
      ],
    };
  }, [reportData]);

  // Compute the average score by day and week
  const averageStats = useMemo(() => {
    if (!reportData.reportProfile) {
      return {
        day: "??",
        week: "??",
      };
    }

    return {
      day: Lo.round(
        reportData.reportProfile.totalWeight /
          reportData.reportProfile.daysElapsed,
        2
      ),
      week: Lo.round(
        reportData.reportProfile.totalWeight /
          reportData.reportProfile.weeksElapsed,
        2
      ),
    };
  }, [reportData]);

  useEffect(() => {
    (async () => {
      const url = `${
        process.env.NEXT_PUBLIC_URL
      }api/auth/get-full-report${Fetcher.toQueryParams({
        ...range,
        utcOffset: moment().utcOffset(),
      })}`;

      const result = await Fetcher.get(url);

      const data = await result.json();

      setReportData(data);
    })();
  }, [range]);

  function buildReport(data) {
    setRange({
      from: moment(data.from).toISOString(),
      to: moment(data.to).toISOString(),
    });
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
      <div className="row mb-4 row-gap-4">
        <div className="col-12 col-lg-8">
          <div className="chart-container">
            <div className="chart-header">
              <h4 className="chart-title">Finding Calendar</h4>
            </div>
            <GradientChart data={calendarData} colors={calendarGradient} />
          </div>
        </div>
        <div className="col-12 col-md-6 col-lg-4 h-100">
          <div className="chart-container">
            <div className="chart-header">
              <h4 className="chart-title">Overall Score</h4>
              <p className="chart-subheading">(Lower is better)</p>
            </div>
            <p className="">
              {`Over a period of ${
                reportData?.reportProfile?.daysElapsed || "..."
              } days, `}
              <strong>
                {`${reportData?.reportProfile?.findings || "..."} findings`}
              </strong>
              {" were discovered ("}
              <strong>
                {`${
                  reportData?.reportProfile?.repeatFindings || "..."
                } repeats`}
              </strong>
              {"), and the total points counted against the score add up to "}
              <strong>{reportData?.reportProfile?.totalWeight}.</strong>
            </p>
            <h6 className="text-center fw-bold">Average points (by)</h6>
            <table className="table mb-0">
              <tbody>
                <tr>
                  <th scope="row">Day</th>
                  <td className="text-end">{averageStats.day}</td>
                </tr>
                <tr>
                  <th scope="row">Week</th>
                  <td className="text-end">{averageStats.week}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <div className="chart-container mb-4">
            <div className="chart-header">
              <h4 className="chart-title">Estimated Contributions</h4>
            </div>
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
          <h6 className="fw-bold text-center">Estimated points by shift</h6>
          <table className="table">
            <tbody>
              {shiftContributionStats.map((stat, i) => (
                <tr key={i}>
                  <th scope="row">{stat.name}</th>
                  <td className="text-end">{stat.contribution}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <div className="chart-container mb-4">
            <div className="chart-header">
              <h4 className="chart-title">Daily Completion Rate</h4>
            </div>
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
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Shift</th>
                <th scope="col">Caught</th>
                <th scope="col">Missed</th>
              </tr>
            </thead>
            <tbody>
              {shiftCompletionStats.map((stat, i) => (
                <tr key={i}>
                  <td>{stat.name}</td>
                  <td className="text-end">{Lo.round(stat.score, 2)}%</td>
                  <td className="text-end">{Lo.round(100 - stat.score, 2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <div className="chart-container mb-4">
            <div className="chart-header">
              <h4 className="chart-title">Repeat Ratio</h4>
            </div>
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
          <p>{repeatRatio}% of findings are repeats.</p>
        </div>
      </div>
    </div>
  );
}
