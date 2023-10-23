import { useRef, useEffect } from "react";

function SquareLoader() {
  const ref = useRef();

  useEffect(() => {
    const { current: elem } = ref;
    elem.style.height = `${elem.offsetWidth}px`;
  }, [ref]);

  return (
    <div
      style={{ height: "290px" }}
      ref={ref}
      className="d-flex justify-content-center align-items-center"
    >
      <p className="lead">Loading Resource</p>
    </div>
  );
}

export default SquareLoader;
