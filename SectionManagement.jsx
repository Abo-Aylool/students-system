import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SectionManagement.css';

function SectionManagement({ socket }) {
  const [sections, setSections] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [sectionName, setSectionName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('📚');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const icons = ['📚', '🎓', '💻', '🔬', '📊', '🎨', '🏆', '📖', '🎯', '🌟', '💡', '🚀'];

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
      const response = await axios.get('http://localhost:5000/api/admin/sections', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSections(response.data);
    } catch (err) {
      setError('Failed to fetch sections');
    }
  };

  const handleCreateSection = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/admin/sections',
        { name: sectionName, icon: selectedIcon, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSections([...sections, response.data]);
      setSuccess('Section created successfully!');
      setSectionName('');
      setDescription('');
      setSelectedIcon('📚');
      setShowModal(false);

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create section');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSection = async (id) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/sections/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSections(sections.filter((s) => s._id !== id));
        setSuccess('Section deleted successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Failed to delete section');
      }
    }
  };

  return (
    <div className="section-management">
      <h1>Section Management</h1>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <button className="create-btn" onClick={() => setShowModal(true)}>
        + Create New Section
      </button>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="modal-close" onClick={() => setShowModal(false)}>
              &times;
            </span>
            <div className="modal-header">Create New Section</div>

            <form onSubmit={handleCreateSection}>
              <div className="form-group">
                <label>Section Name</label>
                <input
                  type="text"
                  value={sectionName}
                  onChange={(e) => setSectionName(e.target.value)}
                  placeholder="Enter section name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter section description (optional)"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Select Icon</label>
                <div className="icon-grid">
                  {icons.map((icon) => (
                    <div
                      key={icon}
                      className={`icon-option ${selectedIcon === icon ? 'selected' : ''}`}
                      onClick={() => setSelectedIcon(icon)}
                    >
                      <span>{icon}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Section'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="sections-list">
        <h2>Current Sections</h2>
        {sections.length === 0 ? (
          <p className="no-data">No sections created yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Icon</th>
                <th>Name</th>
                <th>Description</th>
                <th>Created At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {sections.map((section) => (
                <tr key={section._id}>
                  <td className="icon-cell">{section.icon}</td>
                  <td>{section.name}</td>
                  <td>{section.description || '-'}</td>
                  <td>{new Date(section.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteSection(section._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default SectionManagement;

