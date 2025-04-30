import React from "react";
import { useAppContext } from "../context/AppContext";

const ViewSelector = () => {
  const { viewMode, toggleViewMode } = useAppContext();

  return (
    <div className="view-selector">
      <button
        className={`view-mode-button ${viewMode === "grid" ? "active" : ""}`}
        onClick={toggleViewMode}
        title={
          viewMode === "grid"
            ? "Switch to Standard View"
            : "Switch to Grid View"
        }
      >
        <i
          className={viewMode === "grid" ? "fas fa-list" : "fas fa-th-large"}
        ></i>
      </button>
    </div>
  );
};

export default ViewSelector;
