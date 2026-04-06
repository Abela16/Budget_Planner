import { useState, useMemo } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar,
} from 'recharts';
import { useExpenses } from '../context/ExpenseContext';
import {
  formatCurrency,
  filterExpensesByPeriod,
  calculateCategoryTotals,
  calculateTotal,
  getSpendingTrend,
  getMonthlyTrend,
  getWeeklyTrend,
  getInsights,
} from '../utils/helpers';
import { PAYMENT_METHODS } from '../utils/categories';
import './Analytics.css';

const chartTooltipStyle = {
  background: '#22222e',
  border: '1px solid #2d2d3d',
  borderRadius: 8,
  color: '#e8e8f0',
};

function Analytics() {
  const { expenses, categories, budgets } = useExpenses();
  const [period, setPeriod] = useState('month');

  const periodExpenses = useMemo(() => filterExpensesByPeriod(expenses, period), [expenses, period]);
  const total = useMemo(() => calculateTotal(periodExpenses), [periodExpenses]);
  const categoryTotals = useMemo(() => calculateCategoryTotals(periodExpenses), [periodExpenses]);
  const insights = useMemo(() => getInsights(expenses, categories, budgets), [expenses, categories, budgets]);

  const dailyTrend = useMemo(() => getSpendingTrend(expenses), [expenses]);
  const weeklyTrend = useMemo(() => getWeeklyTrend(expenses), [expenses]);
  const monthlyTrend = useMemo(() => getMonthlyTrend(expenses), [expenses]);

  const pieData = useMemo(() => {
    return Object.entries(categoryTotals)
      .map(([catId, value]) => {
        const cat = categories.find(c => c.id === catId);
        return cat ? { name: cat.name, value, color: cat.color, icon: cat.icon } : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.value - a.value);
  }, [categoryTotals, categories]);

  const paymentBreakdown = useMemo(() => {
    const totals = {};
    periodExpenses.forEach(e => {
      const key = e.paymentMethod || 'other';
      totals[key] = (totals[key] || 0) + e.amount;
    });
    return Object.entries(totals).map(([id, amount]) => {
      const pm = PAYMENT_METHODS.find(p => p.id === id);
      return { name: pm?.name || id, amount, icon: pm?.icon || '💸' };
    }).sort((a, b) => b.amount - a.amount);
  }, [periodExpenses]);

  const avgPerDay = useMemo(() => {
    if (periodExpenses.length === 0) return 0;
    const days = period === 'week' ? 7 : period === 'month' ? 30 : 1;
    return total / days;
  }, [total, periodExpenses, period]);

  return (
    <div className="analytics-page">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Deep dive into your spending patterns</p>
        </div>
        <div className="period-selector">
          {['day', 'week', 'month'].map(p => (
            <button
              key={p}
              className={`period-btn ${period === p ? 'period-btn--active' : ''}`}
              onClick={() => setPeriod(p)}
            >
              {p === 'day' ? 'Today' : p === 'week' ? 'This Week' : 'This Month'}
            </button>
          ))}
        </div>
      </div>

      <div className="analytics-stats">
        <div className="stat-card">
          <span className="stat-icon">💰</span>
          <div className="stat-info">
            <p className="stat-label">Total Spent</p>
            <p className="stat-value">{formatCurrency(total)}</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📊</span>
          <div className="stat-info">
            <p className="stat-label">Transactions</p>
            <p className="stat-value">{periodExpenses.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📐</span>
          <div className="stat-info">
            <p className="stat-label">Avg per Day</p>
            <p className="stat-value">{formatCurrency(avgPerDay)}</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🏷️</span>
          <div className="stat-info">
            <p className="stat-label">Categories Used</p>
            <p className="stat-value">{Object.keys(categoryTotals).length}</p>
          </div>
        </div>
      </div>

      {insights.length > 0 && (
        <div className="insights-section">
          <h2 className="section-title">Actionable Insights</h2>
          <div className="insights-list">
            {insights.map((insight, i) => (
              <div key={i} className={`insight-card insight-card--${insight.type}`}>
                <span className="insight-dot" />
                <p>{insight.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="analytics-grid">
        <div className="chart-card">
          <h2 className="section-title">Daily Spending (30 Days)</h2>
          {dailyTrend.some(d => d.amount > 0) ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d2d3d" />
                <XAxis dataKey="date" tick={{ fill: '#6a6a7d', fontSize: 11 }} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fill: '#6a6a7d', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip contentStyle={chartTooltipStyle} formatter={(v) => [formatCurrency(v), 'Spent']} />
                <Line type="monotone" dataKey="amount" stroke="var(--accent)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">No data for the last 30 days</div>
          )}
        </div>

        <div className="chart-card">
          <h2 className="section-title">Category Breakdown</h2>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3} strokeWidth={0}>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={chartTooltipStyle} formatter={(v) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="category-list">
                {pieData.map(item => (
                  <div key={item.name} className="category-row">
                    <span className="legend-dot" style={{ background: item.color }} />
                    <span className="category-row-name">{item.icon} {item.name}</span>
                    <span className="category-row-value">{formatCurrency(item.value)}</span>
                    <span className="category-row-pct">{((item.value / total) * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="chart-empty">No expenses to analyze</div>
          )}
        </div>

        <div className="chart-card">
          <h2 className="section-title">Weekly Spending (8 Weeks)</h2>
          {weeklyTrend.some(w => w.amount > 0) ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d2d3d" />
                <XAxis dataKey="week" tick={{ fill: '#6a6a7d', fontSize: 11 }} tickLine={false} />
                <YAxis tick={{ fill: '#6a6a7d', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip contentStyle={chartTooltipStyle} formatter={(v) => [formatCurrency(v), 'Spent']} />
                <Bar dataKey="amount" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">No weekly data yet</div>
          )}
        </div>

        <div className="chart-card">
          <h2 className="section-title">Monthly Trend (6 Months)</h2>
          {monthlyTrend.some(m => m.amount > 0) ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d2d3d" />
                <XAxis dataKey="month" tick={{ fill: '#6a6a7d', fontSize: 11 }} tickLine={false} />
                <YAxis tick={{ fill: '#6a6a7d', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip contentStyle={chartTooltipStyle} formatter={(v) => [formatCurrency(v), 'Spent']} />
                <Bar dataKey="amount" fill="#34d399" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">No monthly data yet</div>
          )}
        </div>
      </div>

      {paymentBreakdown.length > 0 && (
        <div className="chart-card">
          <h2 className="section-title">Payment Methods</h2>
          <div className="payment-list">
            {paymentBreakdown.map(pm => (
              <div key={pm.name} className="payment-item">
                <span className="payment-icon">{pm.icon}</span>
                <span className="payment-name">{pm.name}</span>
                <div className="payment-bar-wrapper">
                  <div
                    className="payment-bar"
                    style={{ width: `${(pm.amount / total) * 100}%` }}
                  />
                </div>
                <span className="payment-amount">{formatCurrency(pm.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Analytics;
