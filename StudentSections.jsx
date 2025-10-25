import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StudentSections.css';

function StudentSections({ socket }) {
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [files, setFiles] = useState([]);
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
        if (selectedSection?._id === sectionId) {
          setSelectedSection(null);
          setFiles([]);
        }
      });

      socket.on('file-uploaded', (newFile) => {
        if (selectedSection && newFile.section === selectedSection._id) {
          setFiles((prev) => [...prev, newFile]);
        }
      });

      socket.on('file-deleted', (fileId) => {
        setFiles((prev) => prev.filter((f) => f._id !== fileId));
      });
    }

    return () => {
      if (socket) {
        socket.off('section-added');
        socket.off('section-deleted');
        socket.off('file-uploaded');
        socket.off('file-deleted');
      }
    };
  }, [socket, selectedSection]);

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

  const handleSelectSection = async (section) => {
    setSelectedSection(section);
    setFiles([]);
    setLoading(true);

    try {
      const response = await axios.get(`http://localhost:5000/api/student/files/${section._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFiles(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = (filePath, fileName) => {
    const link = document.createElement('a');
    link.href = `http://localhost:5000/${filePath}`;
    link.download = fileName;
    link.click();
  };

  return (
    <div className="student-sections">
      <h1>Sections & Files</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="sections-files-container">
        <div className="sections-list">
          <h2>Sections</h2>
          {loading && !selectedSection ? (
            <p className="loading-text">Loading sections...</p>
          ) : sections.length === 0 ? (
            <p className="no-data">No sections available.</p>
          ) : (
            <div className="sections-buttons">
              {sections.map((section) => (
                <button
                  key={section._id}
                  className={`section-btn ${selectedSection?._id === section._id ? 'active' : ''}`}
                  onClick={() => handleSelectSection(section)}
                >
                  <span className="section-btn-icon">{section.icon}</span>
                  <span className="section-btn-name">{section.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="files-list">
          <h2>Files</h2>
          {!selectedSection ? (
            <p className="no-data">Select a section to view files.</p>
          ) : loading ? (
            <p className="loading-text">Loading files...</p>
          ) : files.length === 0 ? (
            <p className="no-data">No files in this section.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Original Name</th>
                  <th>Size</th>
                  <th>Uploaded</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file._id}>
                    <td>{file.fileName}</td>
                    <td>{file.originalFileName}</td>
                    <td>{(file.fileSize / 1024).toFixed(2)} KB</td>
                    <td>{new Date(file.uploadedAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="download-btn"
                        onClick={() => downloadFile(file.filePath, file.originalFileName)}
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentSections;

