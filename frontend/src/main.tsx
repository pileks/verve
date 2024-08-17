import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home.tsx";
import Embed from "./pages/Embed.tsx";

import { AaPocProgramProvider } from "./providers/AaPocProgramProvider.tsx";
import { ConnectionProvider } from "@solana/wallet-adapter-react";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home></Home>,
  },
  {
    path: "/embed",
    element: <Embed></Embed>,
  },
]);

const endpoint = "http://localhost:8899";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConnectionProvider endpoint={endpoint}>
      <AaPocProgramProvider>
        <RouterProvider router={router} />
      </AaPocProgramProvider>
    </ConnectionProvider>
  </StrictMode>
);
