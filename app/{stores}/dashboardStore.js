import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { Fetcher } from "@/util/fetchHelpers";
import { useEffect, useState } from "react";

export const useDashboardStore = create(
  persist(
    (set, get) => ({
      forms: [],
      inventory: [],
      shifts: [],
      violations: [],

      setForms(formDocuments) {
        return set(() => ({ forms: formDocuments }));
      },
      setInventory(productDocuments) {
        return set(() => ({ inventory: productDocuments }));
      },
      setShifts(shiftDocuments) {
        return set(() => ({ shifts: shiftDocuments }));
      },
      setViolations(violationDocuments) {
        return set(() => ({ violations: violationDocuments }));
      },
    }),
    {
      name: "session-dashboard-storage", // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // sessionStorage is used for persistence
    }
  )
);

// This hook loads every primitive document owned by the location
// into session storage for easy access later
export function fetchLocationEverything() {
  const dashboardStore = useDashboardStore((state) => state);

  const { setForms, setInventory, setShifts, setViolations } = dashboardStore;

  const [dashboardState, setDBState] = useState({});

  useEffect(() => {
    (async () => {
      const baseURL = process.env.NEXT_PUBLIC_URL + "api/auth/";

      const violationResult = await Fetcher.get(`${baseURL}get-violations`);
      const { data: violations } = await violationResult.json();

      const shiftResult = await Fetcher.get(`${baseURL}get-shifts`);
      const { data: shifts } = await shiftResult.json();

      const inventoryResult = await Fetcher.get(`${baseURL}get-inventory`);
      const { data: products } = await inventoryResult.json();

      const formResult = await Fetcher.get(`${baseURL}get-forms`);
      const { data: forms } = await formResult.json();

      setForms(forms);
      setInventory(products);
      setShifts(shifts);
      setViolations(violations);
    })();
  }, []);

  useEffect(() => {
    setDBState(dashboardStore);
  }, [dashboardStore]);

  return dashboardState;
}
