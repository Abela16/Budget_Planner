# Expense Tracker - Budget Planner

A smart expense tracking system built with React that helps users record, categorize, analyze, and control their spending.

## Features

### Expense Management
- Add, edit, and delete expenses with title, amount, category, date/time, payment method, and notes
- Quick entry with auto-suggested categories based on keywords
- Search, filter by category/payment method, and sort expenses
- Consistent category classification (prevents duplicates like "Food" vs "food")

### Budgeting
- Set monthly budgets per category
- Real-time spending vs. budget progress bars
- Visual alerts when approaching (80%) or exceeding budget limits
- Overview of total budget utilization

### Analytics & Insights
- Spending totals: daily, weekly, and monthly breakdowns
- Category breakdown with pie charts
- Spending trends: daily line chart (30 days), weekly bar chart (8 weeks), monthly bar chart (6 months)
- Payment method distribution
- Actionable insights: month-over-month comparisons, top category, budget warnings

### Data Management
- All data persisted in localStorage
- Export expenses to CSV
- Full backup/restore via JSON export/import
- Clear all data with confirmation

### Categories
- 12 predefined categories (Food, Transport, Rent, Entertainment, Shopping, Utilities, Health, Education, Travel, Personal, Savings, Other)
- Add custom categories with name, emoji icon, and color
- Auto-suggest category based on expense title keywords

### Payment Methods
- Cash, Bank Transfer, Mobile Money, Credit Card, Debit Card, Other

## Tech Stack

- **React 19** with hooks (useState, useReducer, useContext, useMemo, useCallback)
- **Vite 7** for build tooling
- **React Router v7** for page navigation
- **Recharts** for data visualization (Pie, Line, Area, Bar charts)
- **date-fns** for date formatting and calculations
- **UUID** for unique expense identifiers
- **CSS Custom Properties** for consistent dark theme

## Project Structure

```
src/
├── context/          # React Context for global state management
├── utils/            # Categories, storage, helpers, export utilities
├── components/
│   ├── layout/       # Sidebar, Layout wrapper
│   ├── expenses/     # ExpenseForm
│   └── ui/           # Modal
├── pages/            # Dashboard, Expenses, Budget, Analytics, Settings
└── main.jsx          # Entry point
```

## Getting Started

```bash
cd Budget_Planner
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## What I Built & Practiced

### React Fundamentals
1. **Component Composition** - Breaking UI into reusable, logical pieces (Layout, Sidebar, Modal, ExpenseForm, stat cards, chart wrappers)
2. **Props & Data Flow** - One-way data flow from Context to pages to components
3. **State Management** - useReducer + Context API for complex global state (expenses, budgets, categories)
4. **Hooks** - useState, useEffect, useReducer, useContext, useMemo, useCallback, useRef
5. **Side Effects** - localStorage sync via useEffect, keyboard event listeners
6. **Memoization** - useMemo for expensive calculations (filtering, chart data, insights)
7. **Routing** - React Router with nested routes and NavLink active states
8. **Forms** - Controlled components, validation, dynamic suggestions
9. **Conditional Rendering** - Empty states, loading states, alerts, confirmation dialogs
10. **Lists & Keys** - Dynamic rendering with .map() and proper key props
