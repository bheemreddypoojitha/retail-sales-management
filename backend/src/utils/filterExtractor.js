/**
 * Extract unique filter options from dataset
 */
export const extractFilterOptions = (data) => {
  const options = {
    customerRegions: new Set(),
    genders: new Set(),
    productCategories: new Set(),
    tags: new Set(),
    paymentMethods: new Set(),
    orderStatuses: new Set(),
    deliveryTypes: new Set(),
    ageRange: { min: Infinity, max: -Infinity }
  };

  data.forEach(record => {
 
    if (record['Customer Region']) {
      options.customerRegions.add(record['Customer Region']);
    }

    if (record['Gender']) {
      options.genders.add(record['Gender']);
    }

    if (record['Product Category']) {
      options.productCategories.add(record['Product Category']);
    }

    if (record['Tags']) {
      const tags = record['Tags'].split(',').map(t => t.trim()).filter(t => t);
      tags.forEach(tag => options.tags.add(tag));
    }

    if (record['Payment Method']) {
      options.paymentMethods.add(record['Payment Method']);
    }

    if (record['Order Status']) {
      options.orderStatuses.add(record['Order Status']);
    }

    if (record['Delivery Type']) {
      options.deliveryTypes.add(record['Delivery Type']);
    }

    const age = parseInt(record['Age']);
    if (!isNaN(age)) {
      options.ageRange.min = Math.min(options.ageRange.min, age);
      options.ageRange.max = Math.max(options.ageRange.max, age);
    }
  });

  return {
    customerRegions: Array.from(options.customerRegions).sort(),
    genders: Array.from(options.genders).sort(),
    productCategories: Array.from(options.productCategories).sort(),
    tags: Array.from(options.tags).sort(),
    paymentMethods: Array.from(options.paymentMethods).sort(),
    orderStatuses: Array.from(options.orderStatuses).sort(),
    deliveryTypes: Array.from(options.deliveryTypes).sort(),
    ageRange: options.ageRange
  };
};