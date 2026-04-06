import { useState, useRef } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { exportBackup, importBackup } from '../utils/storage';
import { downloadCSV, downloadBackup } from '../utils/exportUtils';
import { normalizeCategory } from '../utils/categories';
import './Settings.css';

const CATEGORY_COLORS = [
  '#f87171', '#fb923c', '#fbbf24', '#34d399', '#4ade80',
  '#22d3ee', '#60a5fa', '#818cf8', '#a78bfa', '#e879f9',
  '#f472b6', '#94a3b8',
];

function Settings() {
  const { categories, expenses, addCategory, removeCategory, clearAll, importData } = useExpenses();
  const fileInputRef = useRef(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const [newCat, setNewCat] = useState({ name: '', icon: '📦', color: '#60a5fa' });
  const [catError, setCatError] = useState('');
  const [importStatus, setImportStatus] = useState(null);

  function handleAddCategory(e) {
    e.preventDefault();
    const name = newCat.name.trim();
    if (!name) { setCatError('Name is required'); return; }

    const exists = categories.some(c => normalizeCategory(c.name) === normalizeCategory(name));
    if (exists) { setCatError('Category already exists'); return; }

    addCategory({
      id: normalizeCategory(name),
      name,
      icon: newCat.icon || '📦',
      color: newCat.color,
    });
    setNewCat({ name: '', icon: '📦', color: '#60a5fa' });
    setCatError('');
  }

  function handleExportCSV() {
    downloadCSV(expenses, categories);
  }

  function handleExportBackup() {
    const json = exportBackup();
    downloadBackup(json);
  }

  function handleImportBackup(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = importBackup(event.target.result);
        importData(data);
        setImportStatus({ type: 'success', message: `Imported ${data.expenses?.length || 0} expenses successfully!` });
      } catch {
        setImportStatus({ type: 'error', message: 'Invalid backup file. Please check the format.' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function handleClearAll() {
    clearAll();
    setShowClearConfirm(false);
  }

  return (
    <div className="settings-page">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage categories, export data, and backup</p>
        </div>
      </div>

      <div className="settings-section">
        <h2 className="section-title">Categories</h2>
        <div className="categories-grid">
          {categories.map(cat => (
            <div key={cat.id} className="category-chip">
              <span className="chip-icon" style={{ background: cat.color + '22', color: cat.color }}>
                {cat.icon}
              </span>
              <span className="chip-name">{cat.name}</span>
              <button
                className="chip-remove"
                onClick={() => removeCategory(cat.id)}
                title="Remove category"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <form className="add-category-form" onSubmit={handleAddCategory}>
          <h3 className="subsection-title">Add Custom Category</h3>
          <div className="form-row">
            <div className="form-group form-group--flex">
              <label className="form-label">Name</label>
              <input
                type="text"
                value={newCat.name}
                onChange={(e) => { setNewCat(prev => ({ ...prev, name: e.target.value })); setCatError(''); }}
                placeholder="e.g., Subscriptions"
              />
            </div>
            <div className="form-group" style={{ width: 80 }}>
              <label className="form-label">Icon</label>
              <input
                type="text"
                value={newCat.icon}
                onChange={(e) => setNewCat(prev => ({ ...prev, icon: e.target.value }))}
                maxLength={2}
                style={{ textAlign: 'center' }}
              />
            </div>
          </div>
          <div className="color-picker">
            <label className="form-label">Color</label>
            <div className="color-options">
              {CATEGORY_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  className={`color-swatch ${newCat.color === color ? 'color-swatch--active' : ''}`}
                  style={{ background: color }}
                  onClick={() => setNewCat(prev => ({ ...prev, color }))}
                />
              ))}
            </div>
          </div>
          {catError && <p className="form-error">{catError}</p>}
          <button type="submit" className="btn btn--primary">Add Category</button>
        </form>
      </div>

      <div className="settings-section">
        <h2 className="section-title">Export Data</h2>
        <div className="export-buttons">
          <button className="btn btn--success" onClick={handleExportCSV} disabled={expenses.length === 0}>
            📄 Export CSV
          </button>
          <button className="btn btn--primary" onClick={handleExportBackup}>
            💾 Download Backup
          </button>
        </div>
      </div>

      <div className="settings-section">
        <h2 className="section-title">Import / Restore</h2>
        <p className="section-subtitle">Restore data from a previously exported backup file (.json)</p>
        <input
          type="file"
          accept=".json"
          ref={fileInputRef}
          onChange={handleImportBackup}
          style={{ display: 'none' }}
        />
        <button className="btn btn--primary" onClick={() => fileInputRef.current?.click()}>
          📂 Import Backup
        </button>
        {importStatus && (
          <p className={`import-status import-status--${importStatus.type}`}>
            {importStatus.message}
          </p>
        )}
      </div>

      <div className="settings-section settings-section--danger">
        <h2 className="section-title">Danger Zone</h2>
        {!showClearConfirm ? (
          <button className="btn btn--danger" onClick={() => setShowClearConfirm(true)}>
            🗑️ Clear All Data
          </button>
        ) : (
          <div className="clear-confirm">
            <p>This will permanently delete all expenses and budgets. Categories will be kept.</p>
            <div className="form-actions">
              <button className="btn btn--ghost" onClick={() => setShowClearConfirm(false)}>Cancel</button>
              <button className="btn btn--danger" onClick={handleClearAll}>Yes, Delete Everything</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Settings;
