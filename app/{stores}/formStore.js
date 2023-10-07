import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useFormStore = create(
  persist(
    (set, get) => ({
      // state for the composition of a finding report
      submissionDate: null,
      submissionFindings: [],
      submissionFullName: null,
      submissionShift: null,

      // methods to mutate the state used in the composition of a report
      setSubDate: (date) => set(() => ({ submissionDate: date })),
      setSubFullName: (fullName) =>
        set(() => ({ submissionFullName: fullName })),
      setSubFindings: (findings) =>
        set(() => ({
          submissionFindings: findings,
        })),
      addSubFinding: (finding) =>
        set(() => ({
          submissionFindings: [...get().submissionFindings, finding],
        })),
      setSubShift: (shift) => set(() => ({ submissionShift: shift })),

      // state used to fetch data from the backend
      form: null,
      inventory: [],
      location: null,
      shifts: [],
      violations: [],

      clearState: () =>
        set(() => ({
          submissionDate: null,
          submissionFindings: [],
          submissionFullName: null,
          submissionShift: null,
          form: null,
          inventory: [],
          location: null,
          shifts: [],
          violations: [],
        })),

      setForm: (newForm) => set(() => ({ form: newForm })),
      setInventory: (newInventory) => set(() => ({ inventory: newInventory })),
      setLocation: (newLocation) => set(() => ({ location: newLocation })),
      setShifts: (newShifts) => set(() => ({ shifts: newShifts })),
      setViolations: (newViolations) =>
        set(() => ({ violations: newViolations })),
    }),
    {
      name: "session-form-storage", // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // sessionStorage is used for persistence
    }
  )
);

export default useFormStore;
