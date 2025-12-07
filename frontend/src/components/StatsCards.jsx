import React from "react";
const StatsCards = ({ data }) => {
  const stats = data.reduce(
    (acc, curr) => {
      const qty = parseInt(curr["Quantity"] || 0, 10);
      const grossStr = String(curr["Total Amount"] || "0").replace(
        /[^0-9.-]+/g,
        ""
      );
      const gross = parseFloat(grossStr || 0);
      const finalStr = String(curr["Final Amount"] || "0").replace(
        /[^0-9.-]+/g,
        ""
      );
      const final = parseFloat(finalStr || 0);
      const discount = gross - final;

      return {
        quantity: acc.quantity + qty,
        revenue: acc.revenue + final,
        discount: acc.discount + discount,
      };
    },
    { quantity: 0, revenue: 0, discount: 0 }
  );

  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="w-full max-w-[800px] mb-4">
      <div className="flex justify-between items-center gap-3">
        <div className="flex-1 bg-white border border-gray-200 rounded-lg p-2.5 shadow-sm min-h-[60px] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Total units sold
              </p>
              <div className="mt-0.5 flex items-baseline gap-2">
                <span className="text-base font-bold text-gray-900">
                  {stats.quantity}
                </span>
              </div>
            </div>
            <div className="p-1.5 bg-gray-50 rounded-md">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
        <div className="flex-1 bg-white border border-gray-200 rounded-lg p-2.5 shadow-sm min-h-[60px] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Total Amount
              </p>
              <div className="mt-0.5 flex items-baseline gap-2">
                <span className="text-base font-bold text-gray-900">
                  {formatCurrency(stats.revenue)}
                </span>
                <span className="text-[12px] font-bold text-gray-500">
                  ({data.length} SRs)
                </span>
              </div>
            </div>
            <div className="p-1.5 bg-gray-50 rounded-md">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-white border border-gray-200 rounded-lg p-2.5 shadow-sm min-h-[60px] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Total Discount
              </p>
              <div className="mt-0.5 flex items-baseline gap-2">
                <span className="text-base font-bold text-gray-900">
                  {formatCurrency(stats.discount)}
                </span>
                <span className="text-[12px] font-bold text-gray-500">
                  ({data.length} SRs)
                </span>
              </div>
            </div>
            <div className="p-1.5 bg-gray-50 rounded-md">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
