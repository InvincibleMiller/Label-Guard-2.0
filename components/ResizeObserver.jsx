import { useEffect } from "react";
import { ResizeObserver as RO } from "@juggle/resize-observer";

function ResizeObserver() {
  useEffect(() => {
    const ro = new RO((entries, observer) => {
      console.log("Elements resized:", entries.length);
      entries.forEach((entry, index) => {
        const { inlineSize: width, blockSize: height } =
          entry.contentBoxSize[0];
        console.log(`Element ${index + 1}:`, `${width}x${height}`);
      });
    });

    const els = document.querySelectorAll("canvas");
    [...els].forEach((el) => ro.observe(el)); // Watch multiple!
  }, []);

  return <script></script>;
}
export default ResizeObserver;
