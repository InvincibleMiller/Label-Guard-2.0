import { map, concat } from "lodash";

export function Hero({ cta, subtext }) {
  return (
    <div className="container-fluid screen-container">
      <div className="row m-auto">
        <div className="col text-center">
          <h1 className="display-1 fw-semibold">
            {map(cta, (component) => {
              if (component._type === "block") {
                return map(
                  component.children,
                  ({ _type: Type, marks, text }) => (
                    <Type className={concat(marks.map((c) => `${c} `))}>
                      {text}
                    </Type>
                  )
                );
              }
            })}
          </h1>
          <h2 className="display-3">{subtext}</h2>
        </div>
      </div>
    </div>
  );
}

export function Features({ features }) {
  return (
    <div className="p-4 feature-section">
      <div className="container-xl">
        <div className="row gap-lg-4 row-gap-4">
          {map(features, (f, i) => (
            <div
              className="feature-card border border-secondary bg-body-secondary shadow-md col-12 col-lg d-md-flex d-lg-block"
              key={i}
            >
              <div className="d-block feature-top m-auto m-md-0 m-lg-auto">
                <div
                  className="feature-thumbnail mb-2"
                  style={{ backgroundImage: `url("${f.thumbnail}")` }}
                ></div>
                <h4 className="text-center">{f.header}</h4>
              </div>
              <p className="text-center m-auto">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
