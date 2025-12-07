import React, { useState, useEffect, useRef } from "react";
import { fetchFilterOptions } from "../services/api";
const MultiSelect = ({ label, options, selected = [], onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (value) => {
    const newSelected = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-md transition-colors whitespace-nowrap ${
          selected.length > 0
            ? "bg-blue-50 text-blue-700 font-medium"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        <span>
          {selected.length > 0 ? `${label} (${selected.length})` : label}
        </span>
        <svg
          className={`w-3 h-3 text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-max min-w-[150px] bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          <div className="p-1">
            {options.map((option) => (
              <label
                key={option}
                className="flex items-center px-2 py-1.5 hover:bg-gray-50 cursor-pointer rounded select-none"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(option)}
                  onChange={() => toggleOption(option)}
                  className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-xs text-gray-700 whitespace-nowrap pr-2">
                  {option}
                </span>
              </label>
            ))}
            {options.length === 0 && (
              <div className="px-2 py-1.5 text-xs text-gray-400">
                Loading...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const DateRangeDropdown = ({ from, to, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasSelection = from || to;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-md transition-colors whitespace-nowrap ${
          hasSelection
            ? "bg-blue-50 text-blue-700 font-medium"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        <span>{hasSelection ? "Date Set" : "Date"}</span>
        <svg
          className={`w-3 h-3 text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 p-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl flex flex-col gap-2 right-0 sm:left-0">
          <div>
            <label className="block text-[10px] font-medium text-gray-500 mb-1">
              From
            </label>
            <input
              type="date"
              value={from || ""}
              onChange={(e) => onChange("dateFrom", e.target.value)}
              className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-gray-500 mb-1">
              To
            </label>
            <input
              type="date"
              value={to || ""}
              onChange={(e) => onChange("dateTo", e.target.value)}
              className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>
          {hasSelection && (
            <button
              onClick={() => {
                onChange("dateFrom", "");
                onChange("dateTo", "");
              }}
              className="text-[10px] text-red-600 hover:text-red-800 font-medium self-end"
            >
              Clear Dates
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const FilterBar = ({ filters, onFilterChange, sortValue, onSortChange }) => {
  const [options, setOptions] = useState({
    customerRegions: [],
    genders: [],
    productCategories: [],
    paymentMethods: [],
    tags: [],
  });

  useEffect(() => {
    fetchFilterOptions()
      .then((res) => setOptions(res.data || {}))
      .catch(console.error);
  }, []);

  const handleMultiChange = (key, newValues) => {
    const newFilters = { ...filters, [key]: newValues };
    if (newValues.length === 0) delete newFilters[key];
    onFilterChange(newFilters);
  };

  const handleDateChange = (key, value) => {
    const newFilters = { ...filters };
    if (value) newFilters[key] = value;
    else delete newFilters[key];
    onFilterChange(newFilters);
  };

  return (
    <div className="w-full py-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => onFilterChange({})}
          className="p-1.5 bg-gray-100 rounded-md text-gray-600 hover:bg-gray-200 shrink-0 transition-colors"
          title="Reset All"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>

        <MultiSelect
          label="Customer Region"
          options={options.customerRegions || []}
          selected={filters.customerRegion || []}
          onChange={(vals) => handleMultiChange("customerRegion", vals)}
        />

        <MultiSelect
          label="Gender"
          options={options.genders || []}
          selected={filters.gender || []}
          onChange={(vals) => handleMultiChange("gender", vals)}
        />

        <MultiSelect
          label="Age Range"
          options={["18-25", "26-35", "36-50", "50+"]}
          selected={filters.ageRange || []}
          onChange={(vals) => handleMultiChange("ageRange", vals)}
        />

        <MultiSelect
          label="Product Category"
          options={options.productCategories || []}
          selected={filters.productCategory || []}
          onChange={(vals) => handleMultiChange("productCategory", vals)}
        />

        <MultiSelect
          label="Tags"
          options={options.tags || []}
          selected={filters.tags || []}
          onChange={(vals) => handleMultiChange("tags", vals)}
        />

        <MultiSelect
          label="Payment Method"
          options={options.paymentMethods || []}
          selected={filters.paymentMethod || []}
          onChange={(vals) => handleMultiChange("paymentMethod", vals)}
        />

        <DateRangeDropdown
          from={filters.dateFrom}
          to={filters.dateTo}
          onChange={handleDateChange}
        />

        <div className="flex items-center ml-auto shrink-0">
          <div className="relative">
            <select
              value={sortValue}
              onChange={(e) => onSortChange(e.target.value)}
              className="appearance-none bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs py-1.5 pl-3 pr-7 rounded-md focus:outline-none cursor-pointer whitespace-nowrap"
            >
              <option value="date-newest">Sort by: Date (Newest)</option>
              <option value="quantity-high">
                Sort by: Quantity (High-Low)
              </option>
              <option value="customer-az">Sort by: Customer Name (A-Z)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
