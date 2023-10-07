// This hook prevents Next.js throwing an error
// when comparing the server to the browser HTML
import { useState, useEffect } from "react";

const useStore = (store, callback) => {
  const result = store(callback);
  const [data, setData] = useState();

  // because we return state from useState with
  // useEffect we effectively move the loading of state
  // from Zustand onto the client side.
  useEffect(() => {
    setData(result);
  }, [result]);

  return data;
};

export default useStore;
