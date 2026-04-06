import { useState, useMemo } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { formatCurrency, formatDate } from '../utils/helpers';
import { PAYMENT_METHODS } from '../utils/categories';
import Modal from '../components/ui/Modal';
import ExpenseForm from '../components/expenses/ExpenseForm';
import './Expenses.css';

function ExpensesPage() {
  const { expenses, categories, deleteExpense } = useExpenses();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    paymentMethod: '',
    sortBy: 'date_desc',
  });

  const filtered = useMemo(() => {
    let result = [...expenses];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(e =>
        e.title.toLowerCase().includes(q) ||
        (e.notes || '').toLowerCase().includes(q)
      );
    }

    if (filters.category) {
      result = result.filter(e => e.categoryId === filters.category);
    }

    if (filters.paymentMethod) {
      result = result.filter(e => e.paymentMethod === filters.paymentMethod);
    }

    switch (filters.sortBy) {
      case 'date_asc':
        result.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case 'amount_desc':
        result.sort((a, b) => b.amount - a.amount);
        break;
      case 'amount_asc':
        result.sort((a, b) => a.amount - b.amount);
        break;
      default:
        result.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    return result;
  }, [expenses, filters]);

  const total = useMemo(() => filtered.reduce((s, e) => s + e.amount, 0), [filtered]);

  function handleFilterChange(e) {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  }

  function handleDelete(id) {
    deleteExpense(id);
    setConfirmDelete(null);
  }

  return (
    <div className="expenses-page">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Expenses</h1>
          <p className="page-subtitle">{filtered.length} expense{filtered.length !== 1 ? 's' : ''} · Total: {formatCurrency(total)}</p>
        </div>
        <button className="btn btn--primary" onClick={() => setShowAddModal(true)}>
          + Add Expense
        </button>
      </div>

      <div className="filters-bar">
        <input
          type="text"
          name="search"
          placeholder="Search expenses..."
          value={filters.search}
          onChange={handleFilterChange}
          className="filter-input"
        />
        <select name="category" value={filters.category} onChange={handleFilterChange}>
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
          ))}
        </select>
        <select name="paymentMethod" value={filters.paymentMethod} onChange={handleFilterChange}>
          <option value="">All Payments</option>
          {PAYMENT_METHODS.map(pm => (
            <option key={pm.id} value={pm.id}>{pm.icon} {pm.name}</option>
          ))}
        </select>
        <select name="sortBy" value={filters.sortBy} onChange={handleFilterChange}>
          <option value="date_desc">Newest First</option>
          <option value="date_asc">Oldest First</option>
          <option value="amount_desc">Highest Amount</option>
          <option value="amount_asc">Lowest Amount</option>
        </select>
      </div>

      {filtered.length > 0 ? (
        <div className="expense-table-wrapper">
          <table className="expense-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Title</th>
                <th>Category</th>
                <th>Payment</th>
                <th className="text-right">Amount</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(exp => {
                const cat = categories.find(c => c.id === exp.categoryId);
                const pm = PAYMENT_METHODS.find(p => p.id === exp.paymentMethod);
                return (
                  <tr key={exp.id}>
                    <td className="cell-date">{formatDate(exp.date)}</td>
                    <td>
                      <div className="cell-title">{exp.title}</div>
                      {exp.notes && <div className="cell-notes">{exp.notes}</div>}
                    </td>
                    <td>
                      <span className="category-badge" style={{ background: (cat?.color || '#94a3b8') + '22', color: cat?.color }}>
                        {cat?.icon} {cat?.name || 'Unknown'}
                      </span>
                    </td>
                    <td className="cell-payment">{pm?.icon} {pm?.name || exp.paymentMethod}</td>
                    <td className="text-right cell-amount">{formatCurrency(exp.amount)}</td>
                    <td className="text-right">
                      <div className="action-buttons">
                        <button className="btn btn--ghost btn--sm" onClick={() => setEditingExpense(exp)} title="Edit">
                          ✏️
                        </button>
                        <button className="btn btn--ghost btn--sm" onClick={() => setConfirmDelete(exp.id)} title="Delete">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <p className="empty-icon">📭</p>
          <p className="empty-text">No expenses found</p>
          <p className="empty-sub">
            {expenses.length === 0 ? 'Start by adding your first expense' : 'Try adjusting your filters'}
          </p>
        </div>
      )}

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Expense"
      >
        <ExpenseForm onClose={() => setShowAddModal(false)} />
      </Modal>

      <Modal
        isOpen={Boolean(editingExpense)}
        onClose={() => setEditingExpense(null)}
        title="Edit Expense"
      >
        {editingExpense && (
          <ExpenseForm expense={editingExpense} onClose={() => setEditingExpense(null)} />
        )}
      </Modal>

      <Modal
        isOpen={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        title="Delete Expense"
        size="sm"
      >
        <div className="delete-confirm">
          <p>Are you sure you want to delete this expense? This action cannot be undone.</p>
          <div className="form-actions">
            <button className="btn btn--ghost" onClick={() => setConfirmDelete(null)}>Cancel</button>
            <button className="btn btn--danger" onClick={() => handleDelete(confirmDelete)}>Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ExpensesPage;
