import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { TonConnectProvider } from "./providers/TonConnectProvider";

createRoot(document.getElementById("root")!).render(
  <TonConnectProvider>
    <App />
  </TonConnectProvider>
);
