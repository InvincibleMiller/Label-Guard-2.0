import { useMemo } from "react";
import Lo from "lodash";

/*
    {{values}}:
    [
        {
            date: "YYYY-MM-DD",
            weight: Number(),
        }
    ]

    {{range}}: {from, to}
*/

function HeatMapCalendar({ range, values, colors }) {
  const squares = useMemo(() =>
    Lo.map(values, ({ weight, date }, i) => {
      return (
        <li key={i}>
          {date} {weight}
        </li>
      );
    })
  );

  return <ul>{squares}</ul>;
}

export default HeatMapCalendar;
