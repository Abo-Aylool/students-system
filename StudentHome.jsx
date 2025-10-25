import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StudentHome.css';

function StudentHome({ user, socket }) {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchSections();

    // Listen for real-time section updates
    if (socket) {
      socket.on('section-added', (newSection) => {
        setSections((prev) => [...prev, newSection]);
      });

      socket.on('section-deleted', (sectionId) => {
        setSections((prev) => prev.filter((s) => s._id !== sectionId));
      });
    }

    return () => {
      if (socket) {
        socket.off('section-added');
        socket.off('section-deleted');
      }
    };
  }, [socket]);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/student/sections', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSections(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load sections');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-home">
      <div className="home-header">
        <h1>Welcome, {user.fullName}!</h1>
        <p className="student-id-display">Student ID: {user.universityId}</p>
      </div>

      <div className="sections-container">
        <h2>Available Sections</h2>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <p className="loading-text">Loading sections...</p>
        ) : sections.length === 0 ? (
          <div className="no-sections">
            <p>No sections available at the moment.</p>
          </div>
        ) : (
          <div className="sections-grid">
            {sections.map((section) => (
              <div key={section._id} className="section-card">
                <div className="section-icon">{section.icon}</div>
                <h3>{section.name}</h3>
                <p>{section.description || 'No description available'}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="ad-space">
        <h3>Advertisement Space</h3>
        <p>Your ads can appear here</p>
      </div>
    </div>
  );
}

export default StudentHome;

