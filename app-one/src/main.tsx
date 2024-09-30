import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ConnectionProvider } from "@solana/wallet-adapter-react";
import { AaPocProgramProvider } from "./providers/AaPocProgramProvider.tsx";

const endpoint = "http://localhost:8899";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConnectionProvider endpoint={endpoint}>
      <AaPocProgramProvider>
        <App />
      </AaPocProgramProvider>
    </ConnectionProvider>
  </StrictMode>
);
