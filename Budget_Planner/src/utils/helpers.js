import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, subMonths, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, isSameDay } from 'date-fns';

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date) {
  return format(new Date(date), 'MMM dd, yyyy');
}

export function formatDateShort(date) {
  return format(new Date(date), 'MMM dd');
}

export function formatDateTime(date) {
  return format(new Date(date), 'MMM dd, yyyy h:mm a');
}

export function getMonthKey(date) {
  return format(new Date(date), 'yyyy-MM');
}

export function getWeekKey(date) {
  const start = startOfWeek(new Date(date));
  return format(start, 'yyyy-MM-dd');
}

export function filterExpensesByPeriod(expenses, period, referenceDate = new Date()) {
  const ref = new Date(referenceDate);

  if (period === 'week') {
    const start = startOfWeek(ref, { weekStartsOn: 1 });
    const end = endOfWeek(ref, { weekStartsOn: 1 });
    return expenses.filter(e => isWithinInterval(new Date(e.date), { start, end }));
  }

  if (period === 'month') {
    const start = startOfMonth(ref);
    const end = endOfMonth(ref);
    return expenses.filter(e => isWithinInterval(new Date(e.date), { start, end }));
  }

  if (period === 'day') {
    return expenses.filter(e => isSameDay(new Date(e.date), ref));
  }

  return expenses;
}

export function calculateCategoryTotals(expenses) {
  const totals = {};
  expenses.forEach(e => {
    if (!totals[e.categoryId]) {
      totals[e.categoryId] = 0;
    }
    totals[e.categoryId] += e.amount;
  });
  return totals;
}

export function calculateTotal(expenses) {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

export function getSpendingTrend(expenses, days = 30) {
  const end = new Date();
  const start = subMonths(end, 1);
  const interval = { start, end };
  const allDays = eachDayOfInterval(interval);

  return allDays.map(day => {
    const dayExpenses = expenses.filter(e => isSameDay(new Date(e.date), day));
    return {
      date: format(day, 'MMM dd'),
      amount: dayExpenses.reduce((sum, e) => sum + e.amount, 0),
    };
  });
}

export function getMonthlyTrend(expenses, months = 6) {
  const end = new Date();
  const start = subMonths(end, months - 1);
  const allMonths = eachMonthOfInterval({ start, end });

  return allMonths.map(monthStart => {
    const monthEnd = endOfMonth(monthStart);
    const monthExpenses = expenses.filter(e =>
      isWithinInterval(new Date(e.date), { start: monthStart, end: monthEnd })
    );
    return {
      month: format(monthStart, 'MMM yyyy'),
      amount: monthExpenses.reduce((sum, e) => sum + e.amount, 0),
    };
  });
}

export function getWeeklyTrend(expenses, weeks = 8) {
  const end = new Date();
  const start = subMonths(end, 2);
  const allWeeks = eachWeekOfInterval({ start, end }, { weekStartsOn: 1 });

  return allWeeks.slice(-weeks).map(weekStart => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const weekExpenses = expenses.filter(e =>
      isWithinInterval(new Date(e.date), { start: weekStart, end: weekEnd })
    );
    return {
      week: format(weekStart, 'MMM dd'),
      amount: weekExpenses.reduce((sum, e) => sum + e.amount, 0),
    };
  });
}

export function getInsights(expenses, categories, budgets) {
  const insights = [];
  const monthExpenses = filterExpensesByPeriod(expenses, 'month');
  const lastMonthExpenses = filterExpensesByPeriod(expenses, 'month', subMonths(new Date(), 1));

  const thisTotal = calculateTotal(monthExpenses);
  const lastTotal = calculateTotal(lastMonthExpenses);

  if (lastTotal > 0) {
    const change = ((thisTotal - lastTotal) / lastTotal) * 100;
    if (change > 20) {
      insights.push({
        type: 'warning',
        message: `Spending is up ${change.toFixed(0)}% compared to last month.`,
      });
    } else if (change < -10) {
      insights.push({
        type: 'success',
        message: `Great job! Spending is down ${Math.abs(change).toFixed(0)}% from last month.`,
      });
    }
  }

  const categoryTotals = calculateCategoryTotals(monthExpenses);
  const topCategoryId = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
  if (topCategoryId) {
    const cat = categories.find(c => c.id === topCategoryId[0]);
    if (cat) {
      insights.push({
        type: 'info',
        message: `${cat.icon} ${cat.name} is your highest spending category this month at ${formatCurrency(topCategoryId[1])}.`,
      });
    }
  }

  for (const [catId, limit] of Object.entries(budgets)) {
    const spent = categoryTotals[catId] || 0;
    const pct = (spent / limit) * 100;
    const cat = categories.find(c => c.id === catId);
    if (!cat) continue;

    if (pct >= 100) {
      insights.push({
        type: 'danger',
        message: `${cat.icon} ${cat.name} budget exceeded! Spent ${formatCurrency(spent)} of ${formatCurrency(limit)}.`,
      });
    } else if (pct >= 80) {
      insights.push({
        type: 'warning',
        message: `${cat.icon} ${cat.name} is at ${pct.toFixed(0)}% of budget. ${formatCurrency(limit - spent)} remaining.`,
      });
    }
  }

  if (monthExpenses.length === 0) {
    insights.push({
      type: 'info',
      message: 'No expenses recorded this month. Start tracking to see insights!',
    });
  }

  return insights;
}
