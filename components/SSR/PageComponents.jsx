import { map, concat } from "lodash";
import Link from "next/link";

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
          <h2 className="display-3 mb-4">{subtext}</h2>
          <Link href="/#price" className="btn btn-primary">
            <h4 className="display-5 px-3">Sign Up</h4>
          </Link>
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

export function PriceSection({ price, description, period, packageName }) {
  return (
    <div
      id="price"
      className="container-fluid screen-container bg-body-tertiary"
    >
      <div className="price-card shadow">
        <h4>{packageName}</h4>
        <hr />
        <div className="display-4 text-center mb-4">
          ${price} {period}
        </div>
        <p className="text-center">{description}</p>
        <div className="d-grid">
          <Link href="/register" className="btn btn-primary">
            <h4 className="mb-0">Sign Up</h4>
          </Link>
        </div>
      </div>
    </div>
  );
}
