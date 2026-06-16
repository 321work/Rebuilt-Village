import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// FireCMS v3 requires the Tailwind/custom stylesheet from @firecms/ui.
// Import the pre-built CSS bundle shipped with the package.
import "@firecms/ui/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
