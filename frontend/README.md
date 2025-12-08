# Frontend - Retail Sales Management System

Modern React application for retail sales data visualization and management with real-time filtering, search capabilities, and responsive design.

## Tech Stack

- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **State Management:** React Hooks (useState, useEffect, useCallback)

## Features

### Search Implementation

Real-time full-text search across customer names and phone numbers with the following characteristics:

- Case-insensitive matching
- Searches as user types (can be debounced for optimization)
- Clear button to reset search
- Maintains compatibility with all active filters and sorting
- Visual feedback during search operations

### Filter Implementation

Comprehensive filtering system with nine filter categories:

**Multi-Select Filters:**

- Customer Region (North, South, East, West, Central)
- Gender (Male, Female, Other)
- Product Category (Electronics, Clothing, etc.)
- Tags (Multiple tag selection)
- Payment Method (Credit Card, Debit Card, Cash, UPI, etc.)
- Order Status (Completed, Pending, Cancelled, Returned)
- Delivery Type (Standard, Express, Store Pickup)

**Range Filters:**

- Age Range (Min-Max numeric input)
- Date Range (From-To date pickers)

**Filter Characteristics:**

- All filters work independently
- All filters work in combination
- Filter state persists across pagination
- "Apply Filters" button prevents unnecessary API calls
- "Clear All" button for quick reset
- Visual indicators for active filters
- Collapsible sections for better organization

### Sorting Implementation

Six comprehensive sorting options:

1. Date (Newest First) - Most recent transactions appear first
2. Date (Oldest First) - Oldest transactions appear first
3. Quantity (High to Low) - Largest quantities first
4. Quantity (Low to High) - Smallest quantities first
5. Customer Name (A-Z) - Alphabetical ascending
6. Customer Name (Z-A) - Alphabetical descending

**Sorting Characteristics:**

- Dropdown selector for easy access
- Preserves all active filters and search queries
- Visual indication of current sort
- Instant application on selection

### Pagination Implementation

Intelligent pagination system with the following features:

- Fixed 10 items per page
- Previous/Next navigation buttons with disabled states
- Page number buttons with current page highlighting
- Ellipsis (...) for large page ranges
- First and last page quick access
- Display of current page and total pages
- Record count information
- Smooth scroll-to-top on page change
- Complete state retention (filters, search, sort)

## Project Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── SearchBar.jsx       # Search input component
│   │   ├── FilterPanel.jsx     # Filter controls
│   │   ├── SortingDropdown.jsx # Sort selector
│   │   ├── SalesTable.jsx      # Data table display
│   │   ├── Pagination.jsx      # Pagination controls
│   │   └── StatsCards.jsx      # Summary statistics
│   ├── services/            # API communication
│   │   └── api.js              # Axios configuration and API calls
│   ├── utils/              # Helper functions (future use)
│   ├── hooks/              # Custom React hooks (future use)
│   ├── styles/             # Additional styles (future use)
│   ├── App.jsx             # Root component
│   ├── main.jsx            # React entry point
│   └── index.css           # Global styles and Tailwind
├── public/                 # Static assets
├── .env                    # Environment variables
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind configuration
└── README.md              # This file
```

## Setup Instructions

### Install Dependencies

```bash
npm install
```

### Configure Environment

Create `.env` file:

```
VITE_API_URL=http://localhost:5000/api
```

For production, create `.env.production`:

```
VITE_API_URL=https://your-backend-url.onrender.com/api
```

### Run Development Server

```bash
npm run dev
```

Application will start at `http://localhost:3000` or `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Build output will be in `dist/` directory

### Preview Production Build

```bash
npm run preview
```

## Component Details

### App.jsx

Root component managing global state including:

- Sales data array
- Loading and error states
- Search term
- Current page number
- Sort option
- All filter values
- Pagination metadata

### SearchBar.jsx

Controlled input component with:

- Local state for input value
- Submit handler
- Clear functionality
- Parent callback on search

### FilterPanel.jsx

Complex filter component featuring:

- Dynamic filter options from API
- Local state for uncommitted changes
- Collapsible filter sections
- Apply and Clear actions
- Checkbox and range inputs

### SortingDropdown.jsx

Simple dropdown selector with:

- Six predefined sort options
- Controlled component pattern
- Parent callback on change

### SalesTable.jsx

Data display component with:

- Responsive table layout
- Formatted currency and dates
- Color-coded status badges
- Comprehensive field display
- Hover effects

### Pagination.jsx

Navigation component featuring:

- Dynamic page number generation
- Disabled state handling
- Ellipsis for large ranges
- Current page highlighting

### StatsCards.jsx

Summary statistics display:

- Total records count
- Total units sold
- Total revenue
- Total discounts
- Icon and color coding

## Key Features

- **Responsive Design:** Works on mobile, tablet, and desktop
- **Loading States:** Skeleton loaders and spinners
- **Error Handling:** User-friendly error messages with retry options
- **Empty States:** Informative messages when no data available
- **Performance Optimized:** useCallback prevents unnecessary re-renders
- **Accessible:** Semantic HTML and proper ARIA labels
- **Modern UI:** Tailwind CSS for clean, professional appearance

## Development

### Adding New Components

1. Create component file in `src/components/`
2. Import in `App.jsx` or parent component
3. Pass necessary props

### Modifying Styles

- Global styles in `src/index.css`
- Component-specific styles use Tailwind utility classes
- Customize Tailwind in `tailwind.config.js`

## Deployment

Recommended platform: Vercel

Configuration:

- Framework Preset: Vite
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variable: `VITE_API_URL=<your-backend-url>/api`

## Performance Tips

- Implement debouncing on search input (currently instant)
- Add React.memo() to expensive components
- Implement virtual scrolling for very large tables
- Use code splitting for route-based components
