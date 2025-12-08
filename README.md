# Retail Sales Management System

## 1. Overview
A full-stack retail transaction management system that enables users to search, filter, sort, and paginate customer transactions efficiently. The application provides a clean UI, fast API responses, and seamless state management across all operations. Built with a scalable backend and a responsive frontend optimized for real-world use.

## 2. Tech Stack
**Frontend:** React, Vite, Axios  
**Backend:** Node.js, Express.js  
**Database:** PostgreSQL (Supabase)  
**Deployment:** Render (Backend), Vercel (Frontend)

## 3. Search Implementation Summary
- Full-text search implemented on **customer name** and **phone number**.  
- Case-insensitive matching using SQL `ILIKE` queries.  
- Search works in combination with filters, sorting, and pagination.  
- API supports dynamic search parameters to ensure high performance.

## 4. Filter Implementation Summary
- Backend supports multi-select and range-based filtering for:
  - Customer Region  
  - Gender  
  - Age Range  
  - Product Category  
  - Tags  
  - Payment Method  
  - Date Range  
- All filters are optional and combinable.  
- Query builder dynamically constructs WHERE clauses without duplication.  
- Frontend state ensures filters persist across pages and while sorting.

## 5. Sorting Implementation Summary
- Sorting supported on:
  - Date (Newest First)  
  - Quantity  
  - Customer Name (A–Z)  
- Sorting is preserved together with search, filters, and pagination.  
- Implemented with dynamic `ORDER BY` conditions in PostgreSQL.

## 6. Pagination Implementation Summary
- Fixed page size: **10 items per page**  
- Supports next/previous navigation  
- Pagination retains:
  - Active search query  
  - Selected filters  
  - Sorting option  
- Backend API returns:
  - Items for current page  
  - Total count  
  - Total pages  

## 7. Setup Instructions

### Backend
```bash
cd backend
npm install


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

3. Create environment file `.env`:

```
DATABASE_URL=your_supabase_postgres_url
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

