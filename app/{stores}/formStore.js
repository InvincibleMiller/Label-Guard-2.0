import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useFormStore = create(
  persist(
    (set, get) => ({
      location: null,
      form: null,
      setLocation: (newLocation) => set((state) => ({ location: newLocation })),
      setForm: (newForm) => set((state) => ({ form: newForm })),
      clearState: () => set((state) => ({ location: null, form: null })),
    }),
    {
      name: "session-form-storage", // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
    }
  )
);

export default useFormStore;
