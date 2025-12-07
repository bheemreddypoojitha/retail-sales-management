export const searchSalesData = (data, searchTerm) => {
  if (!searchTerm || searchTerm.trim() === '') {
    return data;
  }

  const term = searchTerm.toLowerCase().trim();
  
  return data.filter(record => {
    const customerName = (record['Customer Name'] || '').toString().toLowerCase();
    const phoneNumber = (record['Phone Number'] || '').toString().toLowerCase();
    
    return customerName.includes(term) || phoneNumber.includes(term);
  });
};

export const filterSalesData = (data, filters) => {
  return data.filter(record => {
    if (filters.customerRegion && filters.customerRegion.length > 0) {
      const recordRegion = (record['Customer Region'] || '').toString();
      if (!filters.customerRegion.includes(recordRegion)) {
        return false;
      }
    }
    if (filters.gender && filters.gender.length > 0) {
      const recordGender = (record['Gender'] || '').toString();
      if (!filters.gender.includes(recordGender)) {
        return false;
      }
    }
    const age = parseInt(record['Age']);
    if (!isNaN(age)) {
      if (filters.ageMin !== null && age < filters.ageMin) {
        return false;
      }
      if (filters.ageMax !== null && age > filters.ageMax) {
        return false;
      }
    }

    if (filters.productCategory && filters.productCategory.length > 0) {
      const recordCategory = (record['Product Category'] || '').toString();
      if (!filters.productCategory.includes(recordCategory)) {
        return false;
      }
    }

    if (filters.tags && filters.tags.length > 0) {
      const recordTags = (record['Tags'] || '')
        .toString()
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);
      
      const hasMatchingTag = filters.tags.some(filterTag => 
        recordTags.some(recordTag => 
          recordTag.toLowerCase() === filterTag.toLowerCase()
        )
      );
      
      if (!hasMatchingTag) {
        return false;
      }
    }

    if (filters.paymentMethod && filters.paymentMethod.length > 0) {
      const recordPayment = (record['Payment Method'] || '').toString();
      if (!filters.paymentMethod.includes(recordPayment)) {
        return false;
      }
    }

    if (filters.orderStatus && filters.orderStatus.length > 0) {
      const recordStatus = (record['Order Status'] || '').toString();
      if (!filters.orderStatus.includes(recordStatus)) {
        return false;
      }
    }

    if (filters.deliveryType && filters.deliveryType.length > 0) {
      const recordDelivery = (record['Delivery Type'] || '').toString();
      if (!filters.deliveryType.includes(recordDelivery)) {
        return false;
      }
    }

    if (filters.dateFrom || filters.dateTo) {
      const recordDate = new Date(record['Date']);
      
      if (isNaN(recordDate.getTime())) {
        return false;
      }
      
      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        if (recordDate < fromDate) {
          return false;
        }
      }
      
      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (recordDate > toDate) {
          return false;
        }
      }
    }

    return true;
  });
};


export const sortSalesData = (data, sortBy) => {
  const sortedData = [...data];

  switch (sortBy) {
    case 'date-newest':
      return sortedData.sort((a, b) => {
        const dateA = new Date(a['Date']);
        const dateB = new Date(b['Date']);
        return dateB - dateA;
      });
    
    case 'date-oldest':
      return sortedData.sort((a, b) => {
        const dateA = new Date(a['Date']);
        const dateB = new Date(b['Date']);
        return dateA - dateB;
      });
    
    case 'quantity-high':
      return sortedData.sort((a, b) => {
        const qtyA = parseInt(a['Quantity']) || 0;
        const qtyB = parseInt(b['Quantity']) || 0;
        return qtyB - qtyA;
      });
    
    case 'quantity-low':
      return sortedData.sort((a, b) => {
        const qtyA = parseInt(a['Quantity']) || 0;
        const qtyB = parseInt(b['Quantity']) || 0;
        return qtyA - qtyB;
      });
    
    case 'customer-az':
      return sortedData.sort((a, b) => {
        const nameA = (a['Customer Name'] || '').toString().toLowerCase();
        const nameB = (b['Customer Name'] || '').toString().toLowerCase();
        return nameA.localeCompare(nameB);
      });
    
    case 'customer-za':
      return sortedData.sort((a, b) => {
        const nameA = (a['Customer Name'] || '').toString().toLowerCase();
        const nameB = (b['Customer Name'] || '').toString().toLowerCase();
        return nameB.localeCompare(nameA);
      });
    
    default:
      return sortedData;
  }
};

export const paginateData = (data, page, limit) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  return data.slice(startIndex, endIndex);
};