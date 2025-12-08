import { useState } from "react";

const SalesTable = ({ data }) => {
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const standardDate = new Date(dateStr);
    if (!isNaN(standardDate.getTime())) return standardDate;
    if (typeof dateStr === "string" && dateStr.includes("-")) {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        return new Date(
          parseInt(parts[2]),
          parseInt(parts[1]) - 1,
          parseInt(parts[0])
        );
      }
    }
    return null;
  };

  const formatCurrency = (amount) => {
    const cleanAmount = String(amount).replace(/[^0-9.-]+/g, "");
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(parseFloat(cleanAmount) || 0);
  };

  const formatDate = (dateString) => {
    const date = parseDate(dateString);
    if (!date || isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-[#F3F4F6] border-b border-gray-200">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 tracking-wider">
              Transaction ID
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 tracking-wider">
              Date
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 tracking-wider">
              Customer ID
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 tracking-wider">
              Customer Name
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 tracking-wider">
              Phone Number
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 tracking-wider">
              Gender
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 tracking-wider">
              Age
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 tracking-wider">
              Product Category
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 tracking-wider">
              Quantity
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 tracking-wider">
              Total Amount
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
              Customer Region
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
              Product ID
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
              Employee Name
            </th>
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((record, index) => (
            <tr key={index} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                {record["Transaction ID"]}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {formatDate(record["Date"])}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {record["Customer ID"]}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                {record["Customer Name"]}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {record["Phone Number"]}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {record["Gender"]}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {record["Age"]}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {record["Product Category"]}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {record["Quantity"]}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {formatCurrency(
                  record["Final Amount"] || record["Total Amount"]
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {record["Customer Region"]}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {record["Product ID"]}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {record["Employee Name"]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SalesTable;
