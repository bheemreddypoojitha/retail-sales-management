# Architecture Document

**Project:** Retail Sales Management System
**Document Location:** `/docs/architecture.md`

## Table of Contents

1. [Overview](#1-overview)
2. [Backend Architecture](#2-backend-architecture)
3. [Frontend Architecture](#3-frontend-architecture)
4. [Data Flow](#4-data-flow)
5. [Folder Structure](#5-folder-structure)
6. [Module Responsibilities](#6-module-responsibilities)

---

## 1. Overview

The Retail Sales Management System is a full-stack web application built on a **Three-Tier Architecture**. It separates concerns into a Presentation Layer (Frontend), a Business Logic Layer (Backend API), and a Data Layer (File Storage).

- **Architecture Pattern:** Client-Server (RESTful API).
- **Communication:** HTTPS/HTTP via Axios.
- **Data Strategy:** In-memory processing of CSV data with caching for performance optimization.

---

## 2. Backend Architecture

The backend is built using **Node.js** and **Express.js**, following the **MVC (Model-View-Controller)** pattern extended with a **Service Layer** to decouple business logic from HTTP handling.

### Technology Stack

- **Runtime:** Node.js (v18+)
- **Framework:** Express.js 4.x
- **Data Processing:** Papaparse (CSV parsing)
- **Utilities:** CORS, Dotenv

### Architectural Layers

1.  **Routes Layer:** Defines API endpoints and maps them to controllers.
2.  **Controller Layer:** Handles HTTP request/response lifecycles, parameter validation, and status codes.
3.  **Service Layer:** Contains pure business logic (Filtering, Sorting, Searching, Pagination). It is agnostic of the HTTP layer.
4.  **Utils/Data Layer:** Handles file I/O, CSV parsing, and data caching.

---

## 3. Frontend Architecture

The frontend is a Single Page Application (SPA) built with **React**, utilizing a **Component-Based Architecture** with unidirectional data flow.

### Technology Stack

- **Framework:** React 18.2 (Vite Build Tool)
- **Styling:** Tailwind CSS 3.x
- **HTTP Client:** Axios
- **State Management:** React Hooks (`useState`, `useEffect`, `useCallback`)

### State Management Strategy

The application uses a **Lifting State Up** pattern. The root component (`App.jsx`) acts as the single source of truth for:

- Sales Data
- Search Terms
- Active Filters
- Pagination Metadata
- Sorting State

Child components (SearchBar, FilterPanel, etc.) receive data via **props** and communicate changes back to the parent via **callback functions**.

---

## 4. Data Flow

The application follows a strict request-response cycle for all data operations.

### End-to-End Request Cycle

1.  **User Action:** User interacts with the UI (e.g., types in SearchBar or selects a Filter).
2.  **State Update:** The specific component triggers a callback, updating the state in `App.jsx`.
3.  **Effect Trigger:** `useEffect` in `App.jsx` detects the state change and calls `loadData()`.
4.  **API Request:** Axios sends a GET request to `/api/sales` with query parameters (e.g., `?search=john&page=1`).
5.  **Backend Processing:**
    - **Controller:** Receives the request and extracts query params.
    - **Data Loader:** Checks cache or loads raw CSV data.
    - **Service Layer:** Sequentially applies **Search** -> **Filter** -> **Sort** -> **Pagination**.
6.  **Response:** The backend returns a JSON object containing the `data` subset and `pagination` metadata.
7.  **UI Update:** The frontend updates the `salesData` state, triggering a re-render of the `SalesTable` and `StatsCards`.

---

## 5. Folder Structure

The project is organized into two distinct directories for the backend API and the frontend client.

### Backend Structure

```text
backend/
├── src/
│   ├── controllers/       # HTTP Request Handlers
│   │   └── salesController.js
│   ├── services/          # Business Logic (Search, Filter, Sort)
│   │   └── salesService.js
│   ├── utils/             # Data Access & Helpers
│   │   ├── dataLoader.js
│   │   └── filterExtractor.js
│   ├── routes/            # API Route Definitions
│   │   └── salesRoutes.js
│   ├── data/              # Storage
│   │   └── sales_data.csv
│   └── index.js           # Entry Point
├── .env
└── package.json
```

frontend/
├── src/
│ ├── components/ # UI Components
│ │ ├── SearchBar.jsx
│ │ ├── FilterPanel.jsx
│ │ ├── SortingDropdown.jsx
│ │ ├── SalesTable.jsx
│ │ ├── Pagination.jsx
│ │ └── StatsCards.jsx
│ ├── services/ # API Configuration
│ │ └── api.js
│ ├── App.jsx # Root Component (State Container)
│ ├── main.jsx # Entry Point
│ └── index.css # Global Styles (Tailwind)
├── .env
└── package.json

## 6. Module Responsibilities

### Backend Modules

Entry Point (index.js)
Responsibility: Initializes the Express application, configures global middleware (CORS, JSON parsing), and starts the HTTP server.

Routes (routes/salesRoutes.js)
Responsibility: Defines the API endpoints (e.g., GET /api/sales, GET /api/sales/filters) and maps specific HTTP requests to their corresponding Controller functions.

Controller (controllers/salesController.js)
Responsibility: Orchestrates the HTTP request/response lifecycle. It extracts query parameters from the request, validates inputs, invokes the necessary Service layer functions, handles errors, and formats the final JSON response sent to the client.

Service (services/salesService.js)
Responsibility: Contains the core business logic of the application. It performs operations such as searchSalesData, filterSalesData, sortSalesData, and paginateData. This layer is agnostic of the HTTP transport protocol.

Data Loader (utils/dataLoader.js)
Responsibility: Manages file system operations and data access. It handles reading the sales_data.csv file, parsing the raw CSV content into JavaScript objects using Papaparse, and implementing caching mechanisms to optimize performance.

Filter Utils (utils/filterExtractor.js)
Responsibility: Analyze the loaded dataset to dynamically extract unique values (e.g., list of unique Regions or Categories) required to populate the frontend filter dropdowns.

### Frontend Modules

Root Component (App.jsx)
Responsibility: Acts as the central state container for the application. It manages global states such as salesData, searchTerm, filters, and pagination. It coordinates API calls and passes data down to child components.

API Service (services/api.js)
Responsibility: Centralizes HTTP communication configuration. It sets up the Axios instance with base URLs and timeouts, and defines reusable methods like fetchSalesData for interacting with the backend.

Search Component (components/SearchBar.jsx)
Responsibility: Renders the search input field. It manages user input events and triggers the search action (or clear action) to update the parent state.

Filter Component (components/FilterPanel.jsx / FilterBar.jsx)
Responsibility: Renders the filtering UI, including multi-select dropdowns and date pickers. It manages the local state of selected filters and constructs the filter objects sent to the backend.

Stats Component (components/StatsCards.jsx)
Responsibility: Computes and displays key performance indicators (KPIs) such as "Total Units Sold," "Total Revenue," and "Total Discount" based on the currently visible dataset.

Table Component (components/SalesTable.jsx)
Responsibility: Renders the main data grid. It handles the visual presentation of sales records, including the formatting of currency values, dates, and status badges.

Navigation Component (components/Pagination.jsx)
Responsibility: Renders pagination controls (Previous, Next, Page Numbers). It calculates visible page numbers and handles page switching interactions.
