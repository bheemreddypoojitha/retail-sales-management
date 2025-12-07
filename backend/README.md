# Backend - Retail Sales Management System

RESTful API server for retail sales data management with advanced filtering, searching, sorting, and pagination capabilities.

## Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **CSV Parser:** Papaparse
- **Architecture:** MVC with Service Layer

## API Endpoints

### GET /api/sales

Retrieve sales data with optional filters, search, sort, and pagination.

**Query Parameters:**

| Parameter       | Type   | Description                                                                                   |
| --------------- | ------ | --------------------------------------------------------------------------------------------- |
| search          | string | Search by customer name or phone number                                                       |
| page            | number | Page number (default: 1)                                                                      |
| limit           | number | Records per page (default: 10)                                                                |
| sortBy          | string | Sort option (date-newest, date-oldest, quantity-high, quantity-low, customer-az, customer-za) |
| customerRegion  | string | Comma-separated regions                                                                       |
| gender          | string | Comma-separated genders                                                                       |
| ageMin          | number | Minimum age                                                                                   |
| ageMax          | number | Maximum age                                                                                   |
| productCategory | string | Comma-separated categories                                                                    |
| tags            | string | Comma-separated tags                                                                          |
| paymentMethod   | string | Comma-separated payment methods                                                               |
| orderStatus     | string | Comma-separated order statuses                                                                |
| deliveryType    | string | Comma-separated delivery types                                                                |
| dateFrom        | date   | Start date (YYYY-MM-DD)                                                                       |
| dateTo          | date   | End date (YYYY-MM-DD)                                                                         |

**Response Format:**

```json
{
  "success": true,
  "data": [
    {
      "Transaction ID": "...",
      "Customer Name": "..."
      // ... all CSV fields
    }
  ],
  "pagination": {
    "currentPage": 1,
    "pageSize": 10,
    "totalPages": 50,
    "totalRecords": 500,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "filters": {
    "applied": {
      "search": "...",
      "sortBy": "..."
      // ... applied filters
    }
  }
}
```

### GET /api/sales/filters

Returns all available filter options extracted from the dataset.

**Response Format:**

```json
{
  "success": true,
  "data": {
    "customerRegions": ["North", "South", "East", "West", "Central"],
    "genders": ["Male", "Female", "Other"],
    "productCategories": [...],
    "tags": [...],
    "paymentMethods": [...],
    "orderStatuses": [...],
    "deliveryTypes": [...],
    "ageRange": { "min": 18, "max": 75 }
  }
}
```

## Project Structure

```
backend/
├── src/
│   ├── controllers/        # HTTP request handlers
│   │   └── salesController.js
│   ├── services/          # Business logic
│   │   └── salesService.js
│   ├── utils/            # Helper utilities
│   │   ├── dataLoader.js
│   │   └── filterExtractor.js
│   ├── routes/           # API route definitions
│   │   └── salesRoutes.js
│   ├── data/            # CSV data storage
│   │   └── sales_data.csv
│   └── index.js         # Application entry point
├── .env                 # Environment variables
├── package.json         # Dependencies and scripts
└── README.md           # This file
```

## Setup Instructions

### Install Dependencies

```bash
npm install
```

### Add Data File

Place your CSV file at `src/data/sales_data.csv`

### Configure Environment

Create `.env` file:

```
PORT=5000
NODE_ENV=development
```

### Run Development Server

```bash
npm run dev
```

Server will start at `http://localhost:5000`

### Run Production Server

```bash
npm start
```

## Features

- **In-Memory Caching:** CSV data cached after first load for optimal performance
- **Case-Insensitive Search:** Searches across customer names and phone numbers
- **Multi-Select Filters:** Supports multiple selections for categorical filters
- **Range Filters:** Numeric ranges for age and date ranges for transactions
- **Flexible Sorting:** Six different sorting options
- **Efficient Pagination:** Reduces response payload and improves performance
- **Error Handling:** Comprehensive error handling with meaningful messages
- **CORS Enabled:** Configured for cross-origin requests

## Development

### Scripts

- `npm start` - Run production server
- `npm run dev` - Run development server with auto-reload

### Adding New Features

1. Add business logic to `services/`
2. Create controller methods in `controllers/`
3. Define routes in `routes/`
4. Update documentation

## Deployment

Recommended platform: Render.com

Configuration:

- Build Command: `npm install`
- Start Command: `npm start`
- Environment Variables: Set `NODE_ENV=production`
