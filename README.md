# Retail Sales Management System

A comprehensive full-stack web application for retail sales data management with advanced filtering, search, sorting, and pagination capabilities built with modern technologies and production-ready architecture.

## Overview

This system provides an intuitive interface for analyzing retail sales transactions with real-time data processing. It handles large datasets efficiently through optimized backend services and delivers a responsive user experience with React-based frontend, supporting complex multi-criteria filtering and seamless pagination while maintaining state consistency across all operations.

## Tech Stack

### Backend

- Node.js (v18+)
- Express.js
- Papaparse (CSV Processing)

### Frontend

- React 18
- Vite
- Tailwind CSS
- Axios

## Search Implementation Summary

Implemented case-insensitive full-text search functionality that queries across customer names and phone numbers. The search mechanism operates on the server-side, processing data before pagination to ensure accurate result counts. Search terms are trimmed and converted to lowercase for consistent matching, and the implementation maintains complete compatibility with all active filters and sorting options, ensuring users can progressively narrow results through combined search and filter operations.

## Filter Implementation Summary

Comprehensive multi-select and range-based filtering system supporting nine filter categories: Customer Region (multi-select), Gender (multi-select), Age Range (numeric range with min/max), Product Category (multi-select), Tags (multi-select with comma-separated parsing), Payment Method (multi-select), Order Status (multi-select), Delivery Type (multi-select), and Date Range (from-to date picker). All filters operate independently and in combination, with server-side processing ensuring accurate results. Filter state persists across pagination, sorting, and search operations through query parameter synchronization.

## Sorting Implementation Summary

Six comprehensive sorting options implemented: Date (Newest First), Date (Oldest First), Quantity (High to Low), Quantity (Low to High), Customer Name (A-Z), and Customer Name (Z-A). Sorting executes after filtering but before pagination to maintain accurate result ordering. The implementation uses JavaScript's native sort with locale-aware string comparison for alphabetical sorting and numeric comparison for date/quantity sorting. Sort state is maintained across all user interactions through controlled component state and URL synchronization.

## Pagination Implementation Summary

Fixed 10-items-per-page pagination system with intelligent navigation controls. Implementation calculates total pages based on filtered result count and provides Previous/Next buttons with proper disabled states. Page numbers display with ellipsis for large datasets, showing context around current page. All filter, search, and sort states persist across page changes through query parameter management. Smooth scroll-to-top behavior enhances user experience during navigation, and pagination metadata (current page, total pages, total records) is displayed for user awareness.

## Setup Instructions

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git

### Backend Setup

1. Navigate to backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Add dataset:

- Download CSV from provided Google Drive link
- Place file as `backend/src/data/sales_data.csv`

4. Create environment file `.env`:

```
PORT=5000
NODE_ENV=development
```

5. Start development server:

```bash
npm run dev
```

Backend runs at `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create environment file `.env`:

```
VITE_API_URL=http://localhost:5000/api
```

4. Start development server:

```bash
npm run dev
```

Frontend runs at `http://localhost:3000`

### Running Complete Application

Open two terminal windows:

- Terminal 1: `cd backend && npm run dev`
- Terminal 2: `cd frontend && npm run dev`

Access application at `http://localhost:3000`

### Production Deployment

**Backend (Render):**

- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`

**Frontend (Vercel):**

- Framework: Vite
- Root Directory: `frontend`
- Environment Variable: `VITE_API_URL=<backend-url>/api`

## Live Demo

- **Application:** https://your-app.vercel.app
- **API Endpoint:** https://your-api.onrender.com
- **Repository:** https://github.com/your-username/retail-sales-management

## Documentation

Complete system architecture and technical details available at `/docs/architecture.md`
