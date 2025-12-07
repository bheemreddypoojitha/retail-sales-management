import { 
  filterSalesData, 
  sortSalesData, 
  paginateData, 
  searchSalesData 
} from '../services/salesService.js';
import { loadSalesData } from '../utils/dataLoader.js';
import { extractFilterOptions } from '../utils/filterExtractor.js';

export const getSalesData = async (req, res) => {
  try {
    const allData = await loadSalesData();
    
    const { 
      search, 
      page = 1, 
      limit = 10,
      sortBy = 'date-newest',
      customerRegion,
      gender,
      ageMin,
      ageMax,
      productCategory,
      tags,
      paymentMethod,
      dateFrom,
      dateTo,
      orderStatus,
      deliveryType
    } = req.query;

    let processedData = [...allData];
    if (search && search.trim() !== '') {
      processedData = searchSalesData(processedData, search);
    }

    const filters = {
      customerRegion: customerRegion ? customerRegion.split(',').map(r => r.trim()) : [],
      gender: gender ? gender.split(',').map(g => g.trim()) : [],
      ageMin: ageMin ? parseInt(ageMin) : null,
      ageMax: ageMax ? parseInt(ageMax) : null,
      productCategory: productCategory ? productCategory.split(',').map(c => c.trim()) : [],
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      paymentMethod: paymentMethod ? paymentMethod.split(',').map(p => p.trim()) : [],
      orderStatus: orderStatus ? orderStatus.split(',').map(o => o.trim()) : [],
      deliveryType: deliveryType ? deliveryType.split(',').map(d => d.trim()) : [],
      dateFrom: dateFrom || null,
      dateTo: dateTo || null
    };

    processedData = filterSalesData(processedData, filters);
    processedData = sortSalesData(processedData, sortBy);
    const totalRecords = processedData.length;
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const totalPages = Math.ceil(totalRecords / pageSize);
    const paginatedData = paginateData(processedData, pageNumber, pageSize);
    res.status(200).json({
      success: true,
      data: paginatedData,
      pagination: {
        currentPage: pageNumber,
        pageSize: pageSize,
        totalPages: totalPages,
        totalRecords: totalRecords,
        hasNextPage: pageNumber < totalPages,
        hasPrevPage: pageNumber > 1
      },
      filters: {
        applied: {
          search: search || null,
          sortBy: sortBy,
          ...filters
        }
      }
    });

  } catch (error) {
    console.error('Error in getSalesData:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch sales data',
      error: error.message 
    });
  }
};

export const getFilterOptions = async (req, res) => {
  try {
    const allData = await loadSalesData();
    const options = extractFilterOptions(allData);
    
    res.status(200).json({
      success: true,
      data: options
    });
  } catch (error) {
    console.error('Error in getFilterOptions:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch filter options',
      error: error.message 
    });
  }
};