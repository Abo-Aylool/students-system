import React from 'react';
import './AdminHome.css';

function AdminHome({ user }) {
  return (
    <div className="admin-home">
      <h1>Dashboard</h1>
      <p className="welcome-message">Welcome to HMAS Admin Control Panel, {user.fullName}!</p>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-icon">📚</div>
          <div className="card-content">
            <h3>Sections</h3>
            <p>Manage academic sections</p>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">👥</div>
          <div className="card-content">
            <h3>Students</h3>
            <p>Add and manage students</p>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">📁</div>
          <div className="card-content">
            <h3>Files</h3>
            <p>Upload and manage files</p>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">📰</div>
          <div className="card-content">
            <h3>News</h3>
            <p>Publish announcements</p>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">🤖</div>
          <div className="card-content">
            <h3>HMAS Assistant</h3>
            <p>Manage knowledge base</p>
          </div>
        </div>
      </div>

      <div className="info-section">
        <h2>System Information</h2>
        <p>Use the navigation menu on the left to access different management sections. All changes made here will be reflected in real-time to connected students.</p>
      </div>
    </div>
  );
}

export default AdminHome;

