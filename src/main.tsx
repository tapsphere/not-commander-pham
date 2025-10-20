import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "@fontsource/inter/300.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import { TonConnectProvider } from "./providers/TonConnectProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TonConnectProvider>
      <App />
    </TonConnectProvider>
  </StrictMode>
);
