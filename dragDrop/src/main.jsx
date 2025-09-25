// src/main.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { GameProvider } from "./context/GameProvider";
import "./index.css";

const root = createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <GameProvider>
      <App />
    </GameProvider>
  </React.StrictMode>
);
