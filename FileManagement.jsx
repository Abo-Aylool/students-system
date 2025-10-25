import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FileManagement.css';

function FileManagement({ socket }) {
  const [files, setFiles] = useState([]);
  const [sections, setSections] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [fileName, setFileName] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchFiles();
    fetchSections();

    // Listen for real-time file updates
    if (socket) {
      socket.on('file-uploaded', (newFile) => {
        setFiles((prev) => [...prev, newFile]);
      });

      socket.on('file-deleted', (fileId) => {
        setFiles((prev) => prev.filter((f) => f._id !== fileId));
      });
    }

    return () => {
      if (socket) {
        socket.off('file-uploaded');
        socket.off('file-deleted');
      }
    };
  }, [socket]);

  const fetchFiles = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/files', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFiles(response.data);
    } catch (err) {
      setError('Failed to fetch files');
    }
  };

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

  const handleUploadFile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!fileName || !selectedSection || !selectedFile) {
      setError('Please fill all fields');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('fileName', fileName);
    formData.append('section', selectedSection);
    formData.append('file', selectedFile);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/admin/files',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setFiles([...files, response.data]);
      setSuccess('File uploaded successfully!');
      setFileName('');
      setSelectedSection('');
      setSelectedFile(null);
      setShowModal(false);

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = async (id) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/files/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFiles(files.filter((f) => f._id !== id));
        setSuccess('File deleted successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Failed to delete file');
      }
    }
  };

  const getSectionName = (sectionId) => {
    const section = sections.find((s) => s._id === sectionId);
    return section ? section.name : 'Unknown';
  };

  return (
    <div className="file-management">
      <h1>File Management</h1>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <button className="create-btn" onClick={() => setShowModal(true)}>
        + Upload New File
      </button>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="modal-close" onClick={() => setShowModal(false)}>
              &times;
            </span>
            <div className="modal-header">Upload New File</div>

            <form onSubmit={handleUploadFile}>
              <div className="form-group">
                <label>File Name (will appear to students)</label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="Enter file name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Select Section</label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  required
                >
                  <option value="">-- Select a section --</option>
                  {sections.map((section) => (
                    <option key={section._id} value={section._id}>
                      {section.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Choose File</label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  required
                />
              </div>

              <button type="submit" disabled={loading}>
                {loading ? 'Uploading...' : 'Upload File'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="files-list">
        <h2>Uploaded Files</h2>
        {files.length === 0 ? (
          <p className="no-data">No files uploaded yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>File Name</th>
                <th>Section</th>
                <th>Original Name</th>
                <th>Size</th>
                <th>Uploaded At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file._id}>
                  <td>{file.fileName}</td>
                  <td>{getSectionName(file.section)}</td>
                  <td>{file.originalFileName}</td>
                  <td>{(file.fileSize / 1024).toFixed(2)} KB</td>
                  <td>{new Date(file.uploadedAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteFile(file._id)}
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

export default FileManagement;

