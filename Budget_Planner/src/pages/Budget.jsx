import { useState, useMemo } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { formatCurrency, filterExpensesByPeriod, calculateCategoryTotals } from '../utils/helpers';
import './Budget.css';

function BudgetPage() {
  const { categories, budgets, setBudget, removeBudget, expenses } = useExpenses();
  const [editingCategory, setEditingCategory] = useState(null);
  const [budgetInput, setBudgetInput] = useState('');

  const monthExpenses = useMemo(() => filterExpensesByPeriod(expenses, 'month'), [expenses]);
  const categoryTotals = useMemo(() => calculateCategoryTotals(monthExpenses), [monthExpenses]);

  const totalBudget = useMemo(() =>
    Object.values(budgets).reduce((sum, b) => sum + b, 0), [budgets]);
  const totalSpent = useMemo(() =>
    Object.keys(budgets).reduce((sum, catId) => sum + (categoryTotals[catId] || 0), 0), [budgets, categoryTotals]);

  function handleSetBudget(categoryId) {
    const amount = parseFloat(budgetInput);
    if (amount > 0) {
      setBudget(categoryId, amount);
      setEditingCategory(null);
      setBudgetInput('');
    }
  }

  function startEdit(categoryId) {
    setEditingCategory(categoryId);
    setBudgetInput(budgets[categoryId] ? String(budgets[categoryId]) : '');
  }

  const categoriesWithBudgets = categories.filter(c => budgets[c.id]);
  const categoriesWithout = categories.filter(c => !budgets[c.id]);

  return (
    <div className="budget-page">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Budget</h1>
          <p className="page-subtitle">Set and track spending limits per category</p>
        </div>
      </div>

      <div className="budget-overview">
        <div className="budget-overview-item">
          <p className="budget-overview-label">Total Budget</p>
          <p className="budget-overview-value">{formatCurrency(totalBudget)}</p>
        </div>
        <div className="budget-overview-item">
          <p className="budget-overview-label">Total Spent</p>
          <p className="budget-overview-value">{formatCurrency(totalSpent)}</p>
        </div>
        <div className="budget-overview-item">
          <p className="budget-overview-label">Remaining</p>
          <p className={`budget-overview-value ${totalBudget - totalSpent < 0 ? 'over-budget' : ''}`}>
            {formatCurrency(totalBudget - totalSpent)}
          </p>
        </div>
        <div className="budget-overview-item">
          <p className="budget-overview-label">Overall Usage</p>
          <div className="mini-progress">
            <div
              className={`mini-progress-fill ${totalBudget > 0 && (totalSpent / totalBudget) > 0.9 ? 'over' : ''}`}
              style={{ width: `${totalBudget > 0 ? Math.min(100, (totalSpent / totalBudget) * 100) : 0}%` }}
            />
          </div>
          <p className="budget-overview-pct">
            {totalBudget > 0 ? `${((totalSpent / totalBudget) * 100).toFixed(0)}%` : '—'}
          </p>
        </div>
      </div>

      {categoriesWithBudgets.length > 0 && (
        <div className="budget-section">
          <h2 className="section-title">Active Budgets</h2>
          <div className="budget-cards">
            {categoriesWithBudgets.map(cat => {
              const limit = budgets[cat.id];
              const spent = categoryTotals[cat.id] || 0;
              const pct = (spent / limit) * 100;
              const isOver = pct >= 100;
              const isWarning = pct >= 80 && !isOver;

              return (
                <div key={cat.id} className={`budget-card ${isOver ? 'budget-card--over' : isWarning ? 'budget-card--warning' : ''}`}>
                  <div className="budget-card-header">
                    <div className="budget-card-cat">
                      <span className="budget-cat-icon" style={{ background: cat.color + '22', color: cat.color }}>
                        {cat.icon}
                      </span>
                      <span className="budget-cat-name">{cat.name}</span>
                    </div>
                    <div className="budget-card-actions">
                      {editingCategory === cat.id ? (
                        <div className="budget-inline-edit">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={budgetInput}
                            onChange={(e) => setBudgetInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSetBudget(cat.id)}
                            autoFocus
                          />
                          <button className="btn btn--primary btn--sm" onClick={() => handleSetBudget(cat.id)}>Save</button>
                          <button className="btn btn--ghost btn--sm" onClick={() => setEditingCategory(null)}>✕</button>
                        </div>
                      ) : (
                        <>
                          <button className="btn btn--ghost btn--sm" onClick={() => startEdit(cat.id)}>Edit</button>
                          <button className="btn btn--ghost btn--sm" onClick={() => removeBudget(cat.id)}>Remove</button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="budget-progress-bar">
                    <div
                      className={`budget-progress-fill ${isOver ? 'fill--over' : isWarning ? 'fill--warning' : 'fill--ok'}`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                  <div className="budget-card-stats">
                    <span className="budget-spent">{formatCurrency(spent)} spent</span>
                    <span className="budget-limit">of {formatCurrency(limit)}</span>
                    <span className={`budget-pct ${isOver ? 'pct--over' : isWarning ? 'pct--warning' : 'pct--ok'}`}>
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                  {isOver && (
                    <p className="budget-alert">Over budget by {formatCurrency(spent - limit)}</p>
                  )}
                  {isWarning && (
                    <p className="budget-alert budget-alert--warning">{formatCurrency(limit - spent)} remaining</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="budget-section">
        <h2 className="section-title">Set Budget</h2>
        <p className="section-subtitle">Choose a category and set a monthly spending limit</p>
        <div className="budget-add-grid">
          {categoriesWithout.map(cat => (
            <div key={cat.id} className="budget-add-card">
              <div className="budget-add-cat">
                <span className="budget-cat-icon" style={{ background: cat.color + '22', color: cat.color }}>
                  {cat.icon}
                </span>
                <span>{cat.name}</span>
              </div>
              {editingCategory === cat.id ? (
                <div className="budget-inline-edit">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Amount"
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSetBudget(cat.id)}
                    autoFocus
                  />
                  <button className="btn btn--primary btn--sm" onClick={() => handleSetBudget(cat.id)}>Set</button>
                  <button className="btn btn--ghost btn--sm" onClick={() => setEditingCategory(null)}>✕</button>
                </div>
              ) : (
                <button className="btn btn--ghost btn--sm" onClick={() => startEdit(cat.id)}>
                  + Set Budget
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BudgetPage;
