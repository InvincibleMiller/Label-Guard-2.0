import Link from "next/link";
import { useEffect, useState } from "react";

function FormLoadingScreen({ formID }) {
  const [offerReload, setOfferReload] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setOfferReload(true);
    }, 2500);
  }, []);

  return (
    <div className="container-fluid screen-container">
      <div className="row m-auto">
        <div className="col">
          <p>...Loading</p>
          {offerReload && (
            <>
              <Link
                href={`${process.env.NEXT_PUBLIC_URL}form/${formID}/`}
                className="btn btn-link"
              >
                Back to Login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default FormLoadingScreen;
