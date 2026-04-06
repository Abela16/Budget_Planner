const STORAGE_KEYS = {
  EXPENSES: 'expense_tracker_expenses',
  BUDGETS: 'expense_tracker_budgets',
  CATEGORIES: 'expense_tracker_categories',
  SETTINGS: 'expense_tracker_settings',
};

export function loadFromStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function loadExpenses() {
  const data = loadFromStorage(STORAGE_KEYS.EXPENSES);
  if (!data) return [];
  return data.map(e => ({ ...e, date: new Date(e.date) }));
}

export function saveExpenses(expenses) {
  return saveToStorage(STORAGE_KEYS.EXPENSES, expenses);
}

export function loadBudgets() {
  return loadFromStorage(STORAGE_KEYS.BUDGETS) || {};
}

export function saveBudgets(budgets) {
  return saveToStorage(STORAGE_KEYS.BUDGETS, budgets);
}

export function loadCategories() {
  return loadFromStorage(STORAGE_KEYS.CATEGORIES);
}

export function saveCategories(categories) {
  return saveToStorage(STORAGE_KEYS.CATEGORIES, categories);
}

export function exportBackup() {
  const backup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    expenses: loadFromStorage(STORAGE_KEYS.EXPENSES) || [],
    budgets: loadFromStorage(STORAGE_KEYS.BUDGETS) || {},
    categories: loadFromStorage(STORAGE_KEYS.CATEGORIES),
  };
  return JSON.stringify(backup, null, 2);
}

export function importBackup(jsonString) {
  const data = JSON.parse(jsonString);
  if (!data.version || !data.expenses) {
    throw new Error('Invalid backup file');
  }
  if (data.expenses) saveToStorage(STORAGE_KEYS.EXPENSES, data.expenses);
  if (data.budgets) saveToStorage(STORAGE_KEYS.BUDGETS, data.budgets);
  if (data.categories) saveToStorage(STORAGE_KEYS.CATEGORIES, data.categories);
  return data;
}

export { STORAGE_KEYS };
