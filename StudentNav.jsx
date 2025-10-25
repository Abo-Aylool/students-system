import React from 'react';
import { Link } from 'react-router-dom';
import './StudentNav.css';

function StudentNav({ user, onLogout, activeSection, setActiveSection }) {
  const menuItems = [
    { id: 'home', label: 'Home', icon: '🏠', path: '/student' },
    { id: 'sections', label: 'Sections', icon: '📚', path: '/student/sections' },
    { id: 'news', label: 'News', icon: '📰', path: '/student/news' },
    { id: 'assistant', label: 'HMAS Assistant', icon: '🤖', path: '/student/assistant' },
  ];

  return (
    <nav className="student-nav">
      <div className="nav-header">
        <h2>HMAS</h2>
      </div>

      <div className="student-info">
        <p className="student-name">{user.fullName}</p>
        <p className="student-id">{user.universityId}</p>
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

export default StudentNav;

