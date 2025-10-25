import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AssistantManagement.css';

function AssistantManagement({ socket }) {
  const [knowledgeBase, setKnowledgeBase] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchKnowledgeBase();

    // Listen for real-time knowledge base updates
    if (socket) {
      socket.on('knowledge-added', (newEntry) => {
        setKnowledgeBase((prev) => [...prev, newEntry]);
      });

      socket.on('knowledge-deleted', (entryId) => {
        setKnowledgeBase((prev) => prev.filter((e) => e._id !== entryId));
      });
    }

    return () => {
      if (socket) {
        socket.off('knowledge-added');
        socket.off('knowledge-deleted');
      }
    };
  }, [socket]);

  const fetchKnowledgeBase = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/knowledge-base', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setKnowledgeBase(response.data);
    } catch (err) {
      setError('Failed to fetch knowledge base');
    }
  };

  const handleAddEntry = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/admin/knowledge-base',
        { question, answer },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setKnowledgeBase([...knowledgeBase, response.data]);
      setSuccess('Knowledge base entry added successfully!');
      setQuestion('');
      setAnswer('');
      setShowModal(false);

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add entry');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/knowledge-base/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setKnowledgeBase(knowledgeBase.filter((e) => e._id !== id));
        setSuccess('Entry deleted successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Failed to delete entry');
      }
    }
  };

  return (
    <div className="assistant-management">
      <h1>HMAS Assistant - Knowledge Base</h1>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <button className="create-btn" onClick={() => setShowModal(true)}>
        + Add New Q&A
      </button>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="modal-close" onClick={() => setShowModal(false)}>
              &times;
            </span>
            <div className="modal-header">Add New Q&A Entry</div>

            <form onSubmit={handleAddEntry}>
              <div className="form-group">
                <label>Question</label>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Enter the question"
                  required
                />
              </div>

              <div className="form-group">
                <label>Answer</label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Enter the answer"
                  rows="6"
                  required
                />
              </div>

              <button type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add Entry'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="knowledge-list">
        <h2>Knowledge Base Entries</h2>
        {knowledgeBase.length === 0 ? (
          <p className="no-data">No knowledge base entries yet.</p>
        ) : (
          <div className="qa-cards">
            {knowledgeBase.map((entry) => (
              <div key={entry._id} className="qa-card">
                <div className="qa-question">
                  <strong>Q:</strong> {entry.question}
                </div>
                <div className="qa-answer">
                  <strong>A:</strong> {entry.answer}
                </div>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteEntry(entry._id)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AssistantManagement;

