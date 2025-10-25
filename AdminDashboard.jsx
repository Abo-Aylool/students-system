import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminNav from '../components/AdminNav';
import AdminHome from '../components/admin/AdminHome';
import SectionManagement from '../components/admin/SectionManagement';
import StudentManagement from '../components/admin/StudentManagement';
import FileManagement from '../components/admin/FileManagement';
import NewsManagement from '../components/admin/NewsManagement';
import AssistantManagement from '../components/admin/AssistantManagement';
import './AdminDashboard.css';

function AdminDashboard({ user, onLogout, socket }) {
  const [activeSection, setActiveSection] = useState('dashboard');

  return (
    <div className="admin-dashboard">
      <AdminNav user={user} onLogout={onLogout} activeSection={activeSection} setActiveSection={setActiveSection} />
      <div className="admin-content">
        <Routes>
          <Route path="/" element={<AdminHome user={user} />} />
          <Route path="/sections" element={<SectionManagement socket={socket} />} />
          <Route path="/students" element={<StudentManagement />} />
          <Route path="/files" element={<FileManagement socket={socket} />} />
          <Route path="/news" element={<NewsManagement socket={socket} />} />
          <Route path="/assistant" element={<AssistantManagement socket={socket} />} />
        </Routes>
      </div>
    </div>
  );
}

export default AdminDashboard;

