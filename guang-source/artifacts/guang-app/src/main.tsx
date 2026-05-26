import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { setAuthTokenGetter, setBaseUrl } from "@workspace/api-client-react";

setAuthTokenGetter(() => localStorage.getItem("guang_token"));
setBaseUrl("https://guang-production.up.railway.app");

// Apply dark mode before first render to avoid flash of wrong theme
if (localStorage.getItem("guang_dark") === "1") {
  document.body.classList.add("dark");
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);