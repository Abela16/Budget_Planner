import { createContext, useCallback, useContext, useEffect, useReducer } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_CATEGORIES } from '../utils/categories';
import {
  loadBudgets,
  loadCategories,
  loadExpenses,
  saveBudgets,
  saveCategories,
  saveExpenses,
} from '../utils/storage';

const ExpenseContext = createContext(null);

const initialState = {
  expenses: [],
  budgets: {},
  categories: DEFAULT_CATEGORIES,
  initialized: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'INIT':
      return {
        ...state,
        expenses: action.payload.expenses,
        budgets: action.payload.budgets,
        categories: action.payload.categories,
        initialized: true,
      };

    case 'ADD_EXPENSE': {
      const expense = {
        ...action.payload,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
      };
      return { ...state, expenses: [expense, ...state.expenses] };
    }

    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map((expense) =>
          expense.id === action.payload.id
            ? { ...expense, ...action.payload, updatedAt: new Date().toISOString() }
            : expense
        ),
      };

    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter((expense) => expense.id !== action.payload),
      };

    case 'SET_BUDGET':
      return {
        ...state,
        budgets: {
          ...state.budgets,
          [action.payload.categoryId]: action.payload.amount,
        },
      };

    case 'REMOVE_BUDGET': {
      const nextBudgets = { ...state.budgets };
      delete nextBudgets[action.payload];
      return { ...state, budgets: nextBudgets };
    }

    case 'ADD_CATEGORY': {
      const exists = state.categories.some(
        (category) =>
          category.id === action.payload.id ||
          category.name.toLowerCase() === action.payload.name.toLowerCase()
      );

      if (exists) {
        return state;
      }

      return {
        ...state,
        categories: [...state.categories, action.payload],
      };
    }

    case 'REMOVE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter((category) => category.id !== action.payload),
      };

    case 'IMPORT_DATA':
      return {
        ...state,
        expenses: action.payload.expenses.map((expense) => ({
          ...expense,
          date: new Date(expense.date),
        })),
        budgets: action.payload.budgets || state.budgets,
        categories: action.payload.categories || state.categories,
      };

    case 'CLEAR_ALL':
      return {
        ...initialState,
        categories: state.categories,
        initialized: true,
      };

    default:
      return state;
  }
}

export function ExpenseProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const expenses = loadExpenses();
    const budgets = loadBudgets();
    const storedCategories = loadCategories();

    dispatch({
      type: 'INIT',
      payload: {
        expenses,
        budgets,
        categories: storedCategories || DEFAULT_CATEGORIES,
      },
    });
  }, []);

  useEffect(() => {
    if (!state.initialized) {
      return;
    }

    saveExpenses(state.expenses);
  }, [state.expenses, state.initialized]);

  useEffect(() => {
    if (!state.initialized) {
      return;
    }

    saveBudgets(state.budgets);
  }, [state.budgets, state.initialized]);

  useEffect(() => {
    if (!state.initialized) {
      return;
    }

    saveCategories(state.categories);
  }, [state.categories, state.initialized]);

  const addExpense = useCallback((expense) => {
    dispatch({ type: 'ADD_EXPENSE', payload: expense });
  }, []);

  const updateExpense = useCallback((expense) => {
    dispatch({ type: 'UPDATE_EXPENSE', payload: expense });
  }, []);

  const deleteExpense = useCallback((id) => {
    dispatch({ type: 'DELETE_EXPENSE', payload: id });
  }, []);

  const setBudget = useCallback((categoryId, amount) => {
    dispatch({
      type: 'SET_BUDGET',
      payload: { categoryId, amount },
    });
  }, []);

  const removeBudget = useCallback((categoryId) => {
    dispatch({ type: 'REMOVE_BUDGET', payload: categoryId });
  }, []);

  const addCategory = useCallback((category) => {
    dispatch({ type: 'ADD_CATEGORY', payload: category });
  }, []);

  const removeCategory = useCallback((categoryId) => {
    dispatch({ type: 'REMOVE_CATEGORY', payload: categoryId });
  }, []);

  const importData = useCallback((data) => {
    dispatch({ type: 'IMPORT_DATA', payload: data });
  }, []);

  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
  }, []);

  const value = {
    ...state,
    addExpense,
    updateExpense,
    deleteExpense,
    setBudget,
    removeBudget,
    addCategory,
    removeCategory,
    importData,
    clearAll,
  };

  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>;
}

export function useExpenses() {
  const context = useContext(ExpenseContext);

  if (!context) {
    throw new Error('useExpenses must be used within ExpenseProvider');
  }

  return context;
}
