import React from 'react';
import { Link } from 'react-router-dom';
import './AdminNav.css';

function AdminNav({ user, onLogout, activeSection, setActiveSection }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/admin' },
    { id: 'sections', label: 'Section Management', icon: '📚', path: '/admin/sections' },
    { id: 'students', label: 'Student Management', icon: '👥', path: '/admin/students' },
    { id: 'files', label: 'File Management', icon: '📁', path: '/admin/files' },
    { id: 'news', label: 'News & Announcements', icon: '📰', path: '/admin/news' },
    { id: 'assistant', label: 'HMAS Assistant', icon: '🤖', path: '/admin/assistant' },
  ];

  return (
    <nav className="admin-nav">
      <div className="nav-header">
        <h2>HMAS Admin</h2>
        <p className="admin-user">Welcome, {user.fullName}</p>
      </div>

      <ul className="nav-menu">
        {menuItems.map((item) => (
          <li key={item.id}>
            <Link
              to={item.path}
              className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <button className="logout-btn" onClick={onLogout}>
        Logout
      </button>
    </nav>
  );
}

export default AdminNav;

