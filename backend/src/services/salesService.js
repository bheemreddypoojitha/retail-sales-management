import pool from "../utils/db.js";

export const getProcessedSalesData = async (params) => {
  const {
    search,
    page = 1,
    limit = 10,
    sortBy,
    customerRegion,
    gender,
    ageMin,
    ageMax,
    productCategory,
    tags,
    paymentMethod,
    orderStatus,
    deliveryType,
    dateFrom,
    dateTo,
  } = params;

  let queryText = "SELECT * FROM sales WHERE 1=1";
  let countQueryText = "SELECT COUNT(*) as total FROM sales WHERE 1=1";
  const queryParams = [];
  let paramIndex = 1;
  const nextParam = () => `$${paramIndex++}`;
  if (search) {
    const cleanSearch = search.trim();
    const searchPattern = `%${cleanSearch}%`;

    const clause = ` AND (customer_name ILIKE ${nextParam()} OR phone_number ILIKE ${nextParam()})`;
    queryText += clause;
    countQueryText += clause;
    queryParams.push(searchPattern, searchPattern);
  }

  const addFilter = (col, val) => {
    if (!val) return;
    if (val.includes(",")) {
      const opts = val.split(",").map((s) => s.trim());
      const placeholders = opts.map(() => nextParam()).join(",");

      const clause = ` AND ${col} IN (${placeholders})`;
      queryText += clause;
      countQueryText += clause;
      queryParams.push(...opts);
    } else {
      const clause = ` AND ${col} = ${nextParam()}`;
      queryText += clause;
      countQueryText += clause;
      queryParams.push(val.trim());
    }
  };

  addFilter("customer_region", customerRegion);
  addFilter("gender", gender);
  addFilter("product_category", productCategory);
  addFilter("payment_method", paymentMethod);
  addFilter("order_status", orderStatus);
  addFilter("delivery_type", deliveryType);

  if (ageMin) {
    const p = nextParam();
    queryText += ` AND age >= ${p}`;
    countQueryText += ` AND age >= ${p}`;
    queryParams.push(ageMin);
  }
  if (ageMax) {
    const p = nextParam();
    queryText += ` AND age <= ${p}`;
    countQueryText += ` AND age <= ${p}`;
    queryParams.push(ageMax);
  }

  if (dateFrom) {
    const p = nextParam();
    queryText += ` AND date >= ${p}`;
    countQueryText += ` AND date >= ${p}`;
    queryParams.push(dateFrom);
  }
  if (dateTo) {
    const p = nextParam();
    queryText += ` AND date <= ${p}`;
    countQueryText += ` AND date <= ${p}`;
    queryParams.push(dateTo);
  }

  if (tags) {
    const tagList = tags.split(",").map((t) => t.trim());
    const tagClauses = tagList
      .map(() => `tags ILIKE ${nextParam()}`)
      .join(" OR ");

    queryText += ` AND (${tagClauses})`;
    countQueryText += ` AND (${tagClauses})`;
    tagList.forEach((t) => queryParams.push(`%${t}%`));
  }

  if (sortBy) {
    switch (sortBy) {
      case "date-newest":
        queryText += " ORDER BY date DESC";
        break;
      case "date-oldest":
        queryText += " ORDER BY date ASC";
        break;
      case "quantity-high":
        queryText += " ORDER BY quantity DESC";
        break;
      case "quantity-low":
        queryText += " ORDER BY quantity ASC";
        break;
      case "amount-high":
        queryText += " ORDER BY final_amount DESC";
        break;
      case "customer-az":
        queryText += " ORDER BY customer_name ASC";
        break;
      case "customer-za":
        queryText += " ORDER BY customer_name DESC";
        break;
      default:
        queryText += " ORDER BY id DESC";
    }
  } else {
    queryText += " ORDER BY id DESC";
  }

  const offset = (page - 1) * limit;
  const limitParam = nextParam();
  const offsetParam = nextParam();

  queryText += ` LIMIT ${limitParam} OFFSET ${offsetParam}`;

  try {
    const totalResult = await pool.query(countQueryText, queryParams);
    const rowsResult = await pool.query(queryText, [
      ...queryParams,
      limit,
      offset,
    ]);

    const mappedData = rowsResult.rows.map((row) => ({
      "Transaction ID": row.transaction_id,
      Date: row.date,
      "Customer ID": row.customer_id,
      "Customer Name": row.customer_name,
      "Phone Number": row.phone_number,
      Gender: row.gender,
      Age: row.age,
      "Customer Region": row.customer_region,
      "Customer Type": row.customer_type,
      "Product ID": row.product_id,
      "Product Name": row.product_name,
      Brand: row.brand,
      "Product Category": row.product_category,
      Tags: row.tags,
      Quantity: row.quantity,
      "Price per Unit": row.price_per_unit,
      "Discount Percentage": row.discount_percentage,
      "Total Amount": row.total_amount,
      "Final Amount": row.final_amount,
      "Payment Method": row.payment_method,
      "Order Status": row.order_status,
      "Delivery Type": row.delivery_type,
      "Store ID": row.store_id,
      "Store Location": row.store_location,
      "Salesperson ID": row.salesperson_id,
      "Employee Name": row.employee_name,
    }));

    return {
      data: mappedData,
      totalRecords: parseInt(totalResult.rows[0].total || 0),
    };
  } catch (err) {
    console.error("SQL Error in salesService:", err.message);
    throw err;
  }
};

export const getFilterOptions = async () => {
  const getDistinct = async (col) => {
    const result = await pool.query(
      `SELECT DISTINCT ${col} as val FROM sales WHERE ${col} IS NOT NULL ORDER BY ${col} ASC`
    );
    return result.rows.map((r) => r.val);
  };

  return {
    customerRegions: await getDistinct("customer_region"),
    genders: await getDistinct("gender"),
    productCategories: await getDistinct("product_category"),
    paymentMethods: await getDistinct("payment_method"),
    tags: await getDistinct("tags"),
    orderStatuses: await getDistinct("order_status"),
    deliveryTypes: await getDistinct("delivery_type"),
  };
};
