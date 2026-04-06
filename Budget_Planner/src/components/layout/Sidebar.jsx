import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/expenses', label: 'Expenses', icon: '💸' },
  { path: '/budget', label: 'Budget', icon: '🎯' },
  { path: '/analytics', label: 'Analytics', icon: '📈' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-logo">💰</span>
        <h1 className="sidebar-title">ExpenseTracker</h1>
      </div>
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`
            }
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            <span className="sidebar-link-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <p className="sidebar-footer-text">Budget Planner v1.0</p>
      </div>
    </aside>
  );
}

export default Sidebar;
