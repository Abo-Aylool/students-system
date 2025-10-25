import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StudentManagement.css';

function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [universityId, setUniversityId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/students', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(response.data);
    } catch (err) {
      setError('Failed to fetch students');
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/admin/students',
        { fullName, universityId, password },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setStudents([...students, response.data]);
      setSuccess('Student added successfully!');
      setFullName('');
      setUniversityId('');
      setPassword('');
      setShowModal(false);

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add student');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/students/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudents(students.filter((s) => s._id !== id));
        setSuccess('Student deleted successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Failed to delete student');
      }
    }
  };

  return (
    <div className="student-management">
      <h1>Student Management</h1>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <button className="create-btn" onClick={() => setShowModal(true)}>
        + Add New Student
      </button>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="modal-close" onClick={() => setShowModal(false)}>
              &times;
            </span>
            <div className="modal-header">Add New Student</div>

            <form onSubmit={handleAddStudent}>
              <div className="form-group">
                <label>Full Student Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="form-group">
                <label>University ID</label>
                <input
                  type="text"
                  value={universityId}
                  onChange={(e) => setUniversityId(e.target.value)}
                  placeholder="Enter University ID (will be login ID)"
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>

              <button type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add Student'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="students-list">
        <h2>Registered Students</h2>
        {students.length === 0 ? (
          <p className="no-data">No students registered yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Full Name</th>
                <th>University ID</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id}>
                  <td>{student.fullName}</td>
                  <td>{student.universityId}</td>
                  <td>{student.role}</td>
                  <td>{new Date(student.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteStudent(student._id)}
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

export default StudentManagement;

