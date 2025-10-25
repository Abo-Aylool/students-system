import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StudentNews.css';

function StudentNews({ socket }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/student/news', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNews(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load news');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-news">
      <h1>News & Announcements</h1>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <p className="loading-text">Loading news...</p>
      ) : news.length === 0 ? (
        <div className="no-news">
          <p>No news available at the moment.</p>
        </div>
      ) : (
        <div className="news-feed">
          {news.map((newsItem) => (
            <div key={newsItem._id} className="news-item">
              <div className="news-item-header">
                <h2>{newsItem.title}</h2>
                <span className="news-date">
                  {new Date(newsItem.publishedAt).toLocaleDateString()}
                </span>
              </div>
              <p className="news-content">{newsItem.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StudentNews;

