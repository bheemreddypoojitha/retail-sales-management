import { useState, useEffect, useCallback } from "react";
import SearchBar from "./components/SearchBar";
import Sidebar from "./components/SideBar";
import FilterBar from "./components/FilterBar";
import SalesTable from "./components/SalesTable";
import Pagination from "./components/Pagination";
import StatsCards from "./components/StatsCards";
import { fetchSalesData } from "./services/api";

function App() {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("date-newest");
  const [filters, setFilters] = useState({});

  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalPages: 1,
    totalRecords: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        search: searchTerm,
        page: currentPage,
        limit: 10,
        sortBy: sortBy,
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
      };

      Object.entries(filters).forEach(([key, value]) => {
        if (key === "dateFrom" || key === "dateTo") return;
        if (Array.isArray(value) && value.length > 0) {
          params[key] = value.join(",");
        }
        else if (value && value !== "" && !Array.isArray(value)) {
          params[key] = value;
        }
      });

      console.log("Fetching with params:", params);
      const response = await fetchSalesData(params);

      setSalesData(response?.data || []);
      if (response?.pagination) {
        setPagination(response.pagination);
      }
    } catch (err) {
      setError(err.message || "Failed to load data.");
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, currentPage, sortBy, filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const tableElement = document.getElementById("table-container");
    if (tableElement) tableElement.scrollTop = 0;
  };

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="bg-white border-b border-gray-200 px-8 py-5 flex justify-between items-center shrink-0">
          <h1 className="text-xl font-bold text-gray-900">
            Sales Management System
          </h1>
          <div className="w-96">
            <SearchBar onSearch={handleSearch} value={searchTerm} />
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-white flex flex-col">
          <div className="px-8 pt-4 pb-2">
            <FilterBar
              filters={filters}
              onFilterChange={handleFilterChange}
              sortValue={sortBy}
              onSortChange={handleSortChange}
            />
            <StatsCards data={salesData} />
          </div>

          <div
            id="table-container"
            className="flex-1 flex flex-col min-h-0 px-8 overflow-auto"
          >
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center min-h-[200px]">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                <p className="mt-4 text-gray-500 text-sm">Loading...</p>
              </div>
            ) : error ? (
              <div className="flex-1 flex flex-col items-center justify-center text-red-500">
                <p>{error}</p>
                <button
                  onClick={loadData}
                  className="mt-2 text-blue-600 underline"
                >
                  Retry
                </button>
              </div>
            ) : (
              <>
                <SalesTable data={salesData} />
                <div className="mt-auto py-4">
                  <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    totalRecords={pagination.totalRecords}
                    currentCount={salesData.length}
                    onPageChange={handlePageChange}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
