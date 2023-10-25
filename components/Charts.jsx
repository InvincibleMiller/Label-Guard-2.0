import { useRef, useEffect, useState } from "react";
import { Chart as ChartJS } from "chart.js/auto";
import { Chart } from "react-chartjs-2";
import { random } from "faker";

export function GradientChart({ data, colors }) {
  const chartRef = useRef(null);
  const [chartData, setChartData] = useState({
    datasets: [],
  });

  function createGradient(ctx, area) {
    const colorStart = colors[0];
    const colorEnd = colors.at(colors.length - 1);

    const colorMid = random.arrayElement(
      colors.filter((color) => color !== colorStart && color !== colorEnd)
    );

    const gradient = ctx.createLinearGradient(0, area.bottom, 0, area.top);

    gradient.addColorStop(0, colorStart);
    gradient.addColorStop(0.5, colorMid);
    gradient.addColorStop(1, colorEnd);

    return gradient;
  }

  useEffect(() => {
    const chart = chartRef.current;

    if (!chart) {
      return;
    }

    const chartData = {
      ...data,
      datasets: data.datasets.map((dataset) => ({
        ...dataset,
        borderColor: createGradient(chart.ctx, chart.chartArea),
      })),
    };

    setChartData(chartData);
  }, [data]);

  return <Chart ref={chartRef} type="line" data={chartData} />;
}
