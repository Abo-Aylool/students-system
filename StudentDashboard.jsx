import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import StudentNav from '../components/StudentNav';
import StudentHome from '../components/student/StudentHome';
import StudentSections from '../components/student/StudentSections';
import StudentNews from '../components/student/StudentNews';
import StudentAssistant from '../components/student/StudentAssistant';
import './StudentDashboard.css';

function StudentDashboard({ user, onLogout, socket }) {
  const [activeSection, setActiveSection] = useState('home');

  return (
    <div className="student-dashboard">
      <StudentNav user={user} onLogout={onLogout} activeSection={activeSection} setActiveSection={setActiveSection} />
      <div className="student-content">
        <Routes>
          <Route path="/" element={<StudentHome user={user} socket={socket} />} />
          <Route path="/sections" element={<StudentSections socket={socket} />} />
          <Route path="/news" element={<StudentNews socket={socket} />} />
          <Route path="/assistant" element={<StudentAssistant socket={socket} />} />
        </Routes>
      </div>
    </div>
  );
}

export default StudentDashboard;

