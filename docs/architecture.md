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


## 1. Overview
The Retail Sales Management System is a full-stack web application built on a Three-Tier Architecture. It separates concerns into:

- **Presentation Layer (Frontend)** – React SPA  
- **Business Logic Layer (Backend API)** – Node.js + Express.js  
- **Data Layer** – PostgreSQL (Supabase)  

**Architecture Pattern:** Client-Server (RESTful API)  
**Communication:** HTTPS/HTTP via Axios  
**Data Strategy:** In-memory processing of CSV data with caching for performance optimization.

---

## 2. Backend Architecture
The backend follows the **MVC pattern with a Service Layer** to decouple business logic from HTTP request handling.

**Technology Stack**
- Runtime: Node.js 18+
- Framework: Express.js
- Database: PostgreSQL (Supabase)
- Utilities: pg, CORS, Dotenv

**Architectural Layers**
- **Routes Layer:** Defines API endpoints and maps them to controllers.  
- **Controller Layer:** Handles HTTP request/response lifecycle, input validation, and status codes.  
- **Service Layer:** Contains pure business logic for search, filtering, sorting, and pagination.  
- **Utils/Data Layer:** Handles database/CSV access, caching, and helper utilities.  

---

## 3. Frontend Architecture
The frontend is a **Single Page Application (SPA)** built using React, with **Component-Based Architecture** and **unidirectional data flow**.

**Technology Stack**
- Framework: React 18 + Vite
- Styling: Tailwind CSS
- HTTP Client: Axios
- State Management: React Hooks (`useState`, `useEffect`, `useCallback`)

**State Management Strategy**
- Root component (`App.jsx`) acts as a single source of truth for:
  - Sales Data
  - Search Terms
  - Active Filters
  - Pagination Metadata
  - Sorting State
- Child components (SearchBar, FilterPanel, SalesTable, etc.) receive props and communicate changes back via callbacks.

---

## 4. Data Flow
**End-to-End Request Cycle**
1. **User Action:** User interacts with the UI (search, filter, sort, paginate).  
2. **State Update:** Component triggers callback to update root state in `App.jsx`.  
3. **Effect Trigger:** `useEffect` calls `loadData()` with updated query parameters.  
4. **API Request:** Axios GET request to `/api/sales` with query params.  
5. **Backend Processing:**
   - Controller extracts query params and validates inputs.
   - Service Layer applies: Search → Filter → Sort → Pagination.
   - Database/CSV queried (cached in-memory if CSV).  
6. **Response:** Backend returns JSON with data subset and pagination info.  
7. **UI Update:** Frontend updates state, re-rendering SalesTable, StatsCards, etc.

---

## 5. Folder Structure
**Backend**
backend/
├── src/
│ ├── controllers/ # HTTP Request Handlers
│ │ └── salesController.js
│ ├── services/ # Business Logic
│ │ └── salesService.js
│ ├── utils/ # Data Access & Helpers
│ │ ├── db.js
│ │ └── filterExtractor.js
│ ├── routes/ # API Route Definitions
│ │ └── salesRoutes.js
│ ├── data/ # CSV Data
│ │ └── sales_data.csv
│ └── index.js # Entry Point
├── scripts/
│ ├── setupDatabase.js
│ ├── uploadCSV.js
│ ├── uploadToPostgres.js
│ └── migrate.js
├── enable_trigram.js
├── .env
├── package.json
└── README.md


**Frontend**
frontend/
├── src/
│ ├── components/
│ │ ├── SearchBar.jsx
│ │ ├── FilterPanel.jsx
│ │ ├── SortingDropdown.jsx
│ │ ├── SalesTable.jsx
│ │ ├── Pagination.jsx
│ │ └── StatsCards.jsx
│ ├── services/
│ │ └── api.js
│ ├── App.jsx
│ ├── main.jsx
│ └── index.css
├── .env
└── package.json


---

## 6. Module Responsibilities

**Backend Modules**
- **Entry Point (`index.js`)**: Initializes Express app, sets up middleware, and starts the server.  
- **Routes (`routes/salesRoutes.js`)**: Maps API endpoints to controllers.  
- **Controller (`controllers/salesController.js`)**: Handles requests, validates inputs, calls Service layer, formats JSON response.  
- **Service (`services/salesService.js`)**: Implements search, filter, sort, and pagination logic; agnostic of HTTP.  
- **Data Loader (`utils/db.js`)**: Manages database access, caching, and CSV reading.  
- **Filter Utils (`utils/filterExtractor.js`)**: Extracts unique values for filters dynamically.  

**Frontend Modules**
- **Root Component (`App.jsx`)**: Central state container managing global state (data, filters, pagination, search, sort).  
- **API Service (`services/api.js`)**: Axios instance for backend communication and reusable fetch methods.  
- **Search Component (`components/SearchBar.jsx`)**: Renders search input; updates parent state on change.  
- **Filter Component (`components/FilterPanel.jsx`)**: Renders multi-select and range filters; updates parent state.  
- **Table Component (`components/SalesTable.jsx`)**: Displays sales data grid, formats dates, currency, and badges.  
- **Stats Component (`components/StatsCards.jsx`)**: Displays KPIs based on visible data.  
- **Pagination Component (`components/Pagination.jsx`)**: Handles page navigation and triggers state updates for page changes.
