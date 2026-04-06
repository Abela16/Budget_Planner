import { useState, useEffect, useMemo } from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import { PAYMENT_METHODS, suggestCategory } from '../../utils/categories';
import { format } from 'date-fns';
import './ExpenseForm.css';

function ExpenseForm({ expense, onClose }) {
  const { categories, addExpense, updateExpense } = useExpenses();
  const isEditing = Boolean(expense);

  const [form, setForm] = useState({
    title: '',
    amount: '',
    categoryId: '',
    date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    paymentMethod: 'cash',
    notes: '',
  });

  const [suggestedCategory, setSuggestedCategory] = useState(null);

  useEffect(() => {
    if (expense) {
      setForm({
        title: expense.title,
        amount: String(expense.amount),
        categoryId: expense.categoryId,
        date: format(new Date(expense.date), "yyyy-MM-dd'T'HH:mm"),
        paymentMethod: expense.paymentMethod || 'cash',
        notes: expense.notes || '',
      });
    }
  }, [expense]);

  useEffect(() => {
    if (form.title.length >= 3 && !form.categoryId) {
      const suggestion = suggestCategory(categories, form.title);
      setSuggestedCategory(suggestion);
    } else {
      setSuggestedCategory(null);
    }
  }, [form.title, form.categoryId, categories]);

  const sortedCategories = useMemo(() =>
    [...categories].sort((a, b) => a.name.localeCompare(b.name)),
    [categories]
  );

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function applySuggestion() {
    if (suggestedCategory) {
      setForm(prev => ({ ...prev, categoryId: suggestedCategory.id }));
      setSuggestedCategory(null);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    const data = {
      title: form.title.trim(),
      amount: parseFloat(form.amount),
      categoryId: form.categoryId,
      date: new Date(form.date),
      paymentMethod: form.paymentMethod,
      notes: form.notes.trim(),
    };

    if (isEditing) {
      updateExpense({ ...data, id: expense.id });
    } else {
      addExpense(data);
    }
    onClose();
  }

  const isValid = form.title.trim() && parseFloat(form.amount) > 0 && form.categoryId;

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label" htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          type="text"
          value={form.title}
          onChange={handleChange}
          placeholder="e.g., Grocery shopping"
          autoFocus
          required
        />
        {suggestedCategory && (
          <button
            type="button"
            className="category-suggestion"
            onClick={applySuggestion}
          >
            {suggestedCategory.icon} Suggested: {suggestedCategory.name} — click to apply
          </button>
        )}
      </div>

      <div className="form-row">
        <div className="form-group form-group--flex">
          <label className="form-label" htmlFor="amount">Amount ($)</label>
          <input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            value={form.amount}
            onChange={handleChange}
            placeholder="0.00"
            required
          />
        </div>
        <div className="form-group form-group--flex">
          <label className="form-label" htmlFor="date">Date & Time</label>
          <input
            id="date"
            name="date"
            type="datetime-local"
            value={form.date}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group form-group--flex">
          <label className="form-label" htmlFor="categoryId">Category</label>
          <select
            id="categoryId"
            name="categoryId"
            value={form.categoryId}
            onChange={handleChange}
            required
          >
            <option value="">Select category</option>
            {sortedCategories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group form-group--flex">
          <label className="form-label" htmlFor="paymentMethod">Payment Method</label>
          <select
            id="paymentMethod"
            name="paymentMethod"
            value={form.paymentMethod}
            onChange={handleChange}
          >
            {PAYMENT_METHODS.map(pm => (
              <option key={pm.id} value={pm.id}>
                {pm.icon} {pm.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="notes">Notes (optional)</label>
        <textarea
          id="notes"
          name="notes"
          value={form.notes}
          onChange={handleChange}
          placeholder="Add any additional details..."
          rows={2}
        />
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn--ghost" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="btn btn--primary" disabled={!isValid}>
          {isEditing ? 'Update Expense' : 'Add Expense'}
        </button>
      </div>
    </form>
  );
}

export default ExpenseForm;
