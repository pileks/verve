import { Program } from "@coral-xyz/anchor";
import { AaPoc } from "../idl/aa_poc";
import { createContext, useContext } from "react";

const AaPocProgramContext = createContext<Program<AaPoc> | undefined>(
  undefined
);

export const useAaPocProgramContext = () => {
  const context = useContext(AaPocProgramContext);

  return context;
};

export default AaPocProgramContext;
