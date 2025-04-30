import React, { useState, useRef, useEffect } from "react";
import { useAppContext } from "../context/AppContext";

const SortingDropdown = () => {
  const { sortBy, sortDirection, handleSort } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getCurrentSortLabel = () => {
    switch (sortBy) {
      case "name":
        return "Name";
      case "type":
        return "Type";
      case "size":
        return "Size";
      case "date":
        return "Date";
      default:
        return "Name";
    }
  };

  const getSortDirectionIcon = () => {
    return sortDirection === "asc" ? (
      <i className="fas fa-arrow-up" />
    ) : (
      <i className="fas fa-arrow-down" />
    );
  };

  const handleOptionClick = (option) => {
    handleSort(option);
    setIsOpen(false);
  };

  return (
    <div className="sort-dropdown-container" ref={dropdownRef}>
      <button
        className="sort-dropdown-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>Sort by: {getCurrentSortLabel()}</span>
        {getSortDirectionIcon()}
      </button>

      {isOpen && (
        <div className="sort-dropdown-menu">
          <div
            className={`sort-dropdown-option ${
              sortBy === "name" ? "active" : ""
            }`}
            onClick={() => handleOptionClick("name")}
          >
            <span>Name</span>
            {sortBy === "name" && getSortDirectionIcon()}
          </div>

          <div
            className={`sort-dropdown-option ${
              sortBy === "type" ? "active" : ""
            }`}
            onClick={() => handleOptionClick("type")}
          >
            <span>Type</span>
            {sortBy === "type" && getSortDirectionIcon()}
          </div>

          <div
            className={`sort-dropdown-option ${
              sortBy === "size" ? "active" : ""
            }`}
            onClick={() => handleOptionClick("size")}
          >
            <span>Size</span>
            {sortBy === "size" && getSortDirectionIcon()}
          </div>

          <div
            className={`sort-dropdown-option ${
              sortBy === "date" ? "active" : ""
            }`}
            onClick={() => handleOptionClick("date")}
          >
            <span>Date</span>
            {sortBy === "date" && getSortDirectionIcon()}
          </div>
        </div>
      )}
    </div>
  );
};

export default SortingDropdown;
