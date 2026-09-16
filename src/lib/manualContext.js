import { createContext, useContext } from "react";
export const ManualContext = createContext(null);
export function useManual() { return useContext(ManualContext); }
