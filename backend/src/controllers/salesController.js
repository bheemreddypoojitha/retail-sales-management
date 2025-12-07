import {
  getProcessedSalesData,
  getFilterOptions as getFilters,
} from "../services/salesService.js";

export const getSalesData = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { data, totalRecords } = await getProcessedSalesData(req.query);

    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
      success: true,
      data,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalPages,
        totalRecords,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      filters: { applied: req.query },
    });
  } catch (error) {
    console.error("Error in getSalesData:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sales data",
      error: error.message,
    });
  }
};

export const getFilterOptions = async (req, res) => {
  try {
    const options = await getFilters();
    res.status(200).json({
      success: true,
      data: options,
    });
  } catch (error) {
    console.error("Error in getFilterOptions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch filter options",
      error: error.message,
    });
  }
};
