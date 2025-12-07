import { getDatabase } from "../utils/database.js";
export const getProcessedSalesData = async (params) => {
  const db = await getDatabase();
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

  let query = "SELECT * FROM sales WHERE 1=1";
  let countQuery = "SELECT COUNT(*) as total FROM sales WHERE 1=1";
  const queryParams = [];

  if (search) {
    const clause = ` AND (customer_name LIKE ? OR phone_number LIKE ?)`;
    query += clause;
    countQuery += clause;
    queryParams.push(`%${search}%`, `%${search}%`);
  }

  const addFilter = (col, val) => {
    if (!val) return;
    if (val.includes(",")) {
      const opts = val.split(",").map((s) => s.trim());
      const placeholders = opts.map(() => "?").join(",");
      query += ` AND ${col} IN (${placeholders})`;
      countQuery += ` AND ${col} IN (${placeholders})`;
      queryParams.push(...opts);
    } else {
      query += ` AND ${col} = ?`;
      countQuery += ` AND ${col} = ?`;
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
    query += ` AND age >= ?`;
    countQuery += ` AND age >= ?`;
    queryParams.push(ageMin);
  }
  if (ageMax) {
    query += ` AND age <= ?`;
    countQuery += ` AND age <= ?`;
    queryParams.push(ageMax);
  }

  if (dateFrom) {
    query += ` AND date >= ?`;
    countQuery += ` AND date >= ?`;
    queryParams.push(dateFrom);
  }
  if (dateTo) {
    query += ` AND date <= ?`;
    countQuery += ` AND date <= ?`;
    queryParams.push(dateTo);
  }

  if (tags) {
    const tagList = tags.split(",").map((t) => t.trim());
    const tagClauses = tagList.map(() => `tags LIKE ?`).join(" OR ");
    query += ` AND (${tagClauses})`;
    countQuery += ` AND (${tagClauses})`;
    tagList.forEach((t) => queryParams.push(`%${t}%`));
  }

  if (sortBy) {
    switch (sortBy) {
      case "date-newest":
        query += " ORDER BY date DESC";
        break;
      case "date-oldest":
        query += " ORDER BY date ASC";
        break;
      case "quantity-high":
        query += " ORDER BY quantity DESC";
        break;
      case "quantity-low":
        query += " ORDER BY quantity ASC";
        break;
      case "amount-high":
        query += " ORDER BY final_amount DESC";
        break;
      case "customer-az":
        query += " ORDER BY customer_name ASC";
        break;
      case "customer-za":
        query += " ORDER BY customer_name DESC";
        break;
      default:
        query += " ORDER BY id DESC";
    }
  }

  const offset = (page - 1) * limit;
  query += ` LIMIT ? OFFSET ?`;

  const totalResult = await db.get(countQuery, queryParams);
  const rows = await db.all(query, [...queryParams, limit, offset]);

  const mappedData = rows.map((row) => ({
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
    totalRecords: totalResult.total,
  };
};

export const getFilterOptions = async () => {
  const db = await getDatabase();
  const getDistinct = async (col) =>
    (
      await db.all(
        `SELECT DISTINCT ${col} as val FROM sales WHERE ${col} IS NOT NULL ORDER BY ${col} ASC`
      )
    ).map((r) => r.val);

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
