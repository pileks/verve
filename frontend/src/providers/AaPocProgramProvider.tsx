import React, { useEffect, useState } from "react";
import AaPocProgramContext from "./AaPocProgramContext";
import { useConnection } from "@solana/wallet-adapter-react";
import { AaPoc } from "../idl/aa_poc";
import { Program } from "@coral-xyz/anchor";
import aaPocIdl from "../idl/aa_poc.json";

export const AaPocProgramProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { connection } = useConnection();
  const [program, setProgram] = useState<Program<AaPoc> | undefined>(undefined);

  useEffect(() => {
    const program = new Program(aaPocIdl as AaPoc, { connection });

    setProgram(program);
  }, [connection]);

  return (
    <AaPocProgramContext.Provider value={program}>
      {children}
    </AaPocProgramContext.Provider>
  );
};
