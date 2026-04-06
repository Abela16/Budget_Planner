import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { useExpenses } from '../context/ExpenseContext';
import {
  formatCurrency,
  filterExpensesByPeriod,
  calculateTotal,
  calculateCategoryTotals,
  getSpendingTrend,
  getInsights,
  formatDate,
} from '../utils/helpers';
import Modal from '../components/ui/Modal';
import ExpenseForm from '../components/expenses/ExpenseForm';
import './Dashboard.css';

function Dashboard() {
  const { expenses, categories, budgets } = useExpenses();
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);

  const monthExpenses = useMemo(() => filterExpensesByPeriod(expenses, 'month'), [expenses]);
  const weekExpenses = useMemo(() => filterExpensesByPeriod(expenses, 'week'), [expenses]);
  const todayExpenses = useMemo(() => filterExpensesByPeriod(expenses, 'day'), [expenses]);

  const monthTotal = useMemo(() => calculateTotal(monthExpenses), [monthExpenses]);
  const weekTotal = useMemo(() => calculateTotal(weekExpenses), [weekExpenses]);
  const todayTotal = useMemo(() => calculateTotal(todayExpenses), [todayExpenses]);

  const categoryTotals = useMemo(() => calculateCategoryTotals(monthExpenses), [monthExpenses]);
  const trend = useMemo(() => getSpendingTrend(expenses), [expenses]);
  const insights = useMemo(() => getInsights(expenses, categories, budgets), [expenses, categories, budgets]);

  const pieData = useMemo(() => {
    return Object.entries(categoryTotals)
      .map(([catId, total]) => {
        const cat = categories.find(c => c.id === catId);
        return cat ? { name: cat.name, value: total, color: cat.color, icon: cat.icon } : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.value - a.value);
  }, [categoryTotals, categories]);

  const totalBudget = useMemo(() =>
    Object.values(budgets).reduce((sum, b) => sum + b, 0),
    [budgets]
  );

  const recentExpenses = expenses.slice(0, 5);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Your financial overview at a glance</p>
        </div>
        <button className="btn btn--primary" onClick={() => setShowAddModal(true)}>
          + Add Expense
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">📅</span>
          <div className="stat-info">
            <p className="stat-label">Today</p>
            <p className="stat-value">{formatCurrency(todayTotal)}</p>
            <p className="stat-sub">{todayExpenses.length} transaction{todayExpenses.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📆</span>
          <div className="stat-info">
            <p className="stat-label">This Week</p>
            <p className="stat-value">{formatCurrency(weekTotal)}</p>
            <p className="stat-sub">{weekExpenses.length} transaction{weekExpenses.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="stat-card stat-card--highlight">
          <span className="stat-icon">🗓️</span>
          <div className="stat-info">
            <p className="stat-label">This Month</p>
            <p className="stat-value">{formatCurrency(monthTotal)}</p>
            <p className="stat-sub">{monthExpenses.length} transaction{monthExpenses.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🎯</span>
          <div className="stat-info">
            <p className="stat-label">Monthly Budget</p>
            <p className="stat-value">{totalBudget > 0 ? formatCurrency(totalBudget) : 'Not set'}</p>
            {totalBudget > 0 && (
              <p className="stat-sub">
                {formatCurrency(Math.max(0, totalBudget - monthTotal))} remaining
              </p>
            )}
          </div>
        </div>
      </div>

      {insights.length > 0 && (
        <div className="insights-section">
          <h2 className="section-title">Insights</h2>
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

      <div className="dashboard-charts">
        <div className="chart-card">
          <h2 className="section-title">Spending Trend (30 Days)</h2>
          {trend.some(t => t.amount > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: '#6a6a7d', fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fill: '#6a6a7d', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip
                  contentStyle={{ background: '#22222e', border: '1px solid #2d2d3d', borderRadius: 8, color: '#e8e8f0' }}
                  formatter={(value) => [formatCurrency(value), 'Spent']}
                />
                <Area type="monotone" dataKey="amount" stroke="var(--accent)" fillOpacity={1} fill="url(#colorAmount)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">No spending data yet for the last 30 days</div>
          )}
        </div>

        <div className="chart-card">
          <h2 className="section-title">Category Breakdown</h2>
          {pieData.length > 0 ? (
            <div className="pie-layout">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    strokeWidth={0}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#22222e', border: '1px solid #2d2d3d', borderRadius: 8, color: '#e8e8f0' }}
                    formatter={(value) => formatCurrency(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pie-legend">
                {pieData.slice(0, 5).map((item) => (
                  <div key={item.name} className="legend-item">
                    <span className="legend-dot" style={{ background: item.color }} />
                    <span className="legend-name">{item.icon} {item.name}</span>
                    <span className="legend-value">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="chart-empty">Add expenses to see category breakdown</div>
          )}
        </div>
      </div>

      <div className="recent-section">
        <div className="section-header">
          <h2 className="section-title">Recent Expenses</h2>
          {expenses.length > 0 && (
            <button className="btn btn--ghost btn--sm" onClick={() => navigate('/expenses')}>
              View All
            </button>
          )}
        </div>
        {recentExpenses.length > 0 ? (
          <div className="recent-list">
            {recentExpenses.map(exp => {
              const cat = categories.find(c => c.id === exp.categoryId);
              return (
                <div key={exp.id} className="recent-item">
                  <div className="recent-item-icon" style={{ background: cat?.color + '22', color: cat?.color }}>
                    {cat?.icon || '📦'}
                  </div>
                  <div className="recent-item-info">
                    <p className="recent-item-title">{exp.title}</p>
                    <p className="recent-item-meta">{cat?.name} · {formatDate(exp.date)}</p>
                  </div>
                  <p className="recent-item-amount">-{formatCurrency(exp.amount)}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <p className="empty-icon">📭</p>
            <p className="empty-text">No expenses yet</p>
            <p className="empty-sub">Click "Add Expense" to get started</p>
          </div>
        )}
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Expense">
        <ExpenseForm onClose={() => setShowAddModal(false)} />
      </Modal>
    </div>
  );
}

export default Dashboard;
