// This hook enables the persistence of data in the form
// during one session
import { useState, useEffect } from "react";

const useStore = (store, callback) => {
  const result = store(callback);
  const [data, setData] = useState();

  useEffect(() => {
    setData(result);
  }, [result]);

  return data;
};

export default useStore;
