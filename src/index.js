/*
 * Entry point for the Calendar App.  This file renders the top-level `App`
 * component into the DOM.  React's `StrictMode` is enabled to catch
 * potential problems during development.  Stylesheets are imported
 * globally here.
 */
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode baseName="/calendar-system/">
        <App />
    </React.StrictMode>
);
