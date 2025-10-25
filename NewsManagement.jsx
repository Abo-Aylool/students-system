import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './NewsManagement.css';

function NewsManagement({ socket }) {
  const [news, setNews] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchNews();

    // Listen for real-time news updates
    if (socket) {
      socket.on('news-published', (newNews) => {
        setNews((prev) => [newNews, ...prev]);
      });

      socket.on('news-deleted', (newsId) => {
        setNews((prev) => prev.filter((n) => n._id !== newsId));
      });
    }

    return () => {
      if (socket) {
        socket.off('news-published');
        socket.off('news-deleted');
      }
    };
  }, [socket]);

  const fetchNews = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/news', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNews(response.data);
    } catch (err) {
      setError('Failed to fetch news');
    }
  };

  const handlePublishNews = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/admin/news',
        { title, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNews([response.data, ...news]);
      setSuccess('News published successfully!');
      setTitle('');
      setContent('');
      setShowModal(false);

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish news');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNews = async (id) => {
    if (window.confirm('Are you sure you want to delete this news?')) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/news/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNews(news.filter((n) => n._id !== id));
        setSuccess('News deleted successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Failed to delete news');
      }
    }
  };

  return (
    <div className="news-management">
      <h1>News & Announcements</h1>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <button className="create-btn" onClick={() => setShowModal(true)}>
        + Publish New Announcement
      </button>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="modal-close" onClick={() => setShowModal(false)}>
              &times;
            </span>
            <div className="modal-header">Publish New Announcement</div>

            <form onSubmit={handlePublishNews}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter announcement title"
                  required
                />
              </div>

              <div className="form-group">
                <label>Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter announcement content"
                  rows="6"
                  required
                />
              </div>

              <button type="submit" disabled={loading}>
                {loading ? 'Publishing...' : 'Publish Announcement'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="news-list">
        <h2>Current News</h2>
        {news.length === 0 ? (
          <p className="no-data">No news published yet.</p>
        ) : (
          <div className="news-cards">
            {news.map((newsItem) => (
              <div key={newsItem._id} className="news-card">
                <div className="news-header">
                  <h3>{newsItem.title}</h3>
                  <span className="news-date">
                    {new Date(newsItem.publishedAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="news-content">{newsItem.content}</p>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteNews(newsItem._id)}
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

export default NewsManagement;

