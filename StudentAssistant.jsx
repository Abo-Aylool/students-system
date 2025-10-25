import React, { useState } from 'react';
import axios from 'axios';
import './StudentAssistant.css';

function StudentAssistant({ socket }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const token = localStorage.getItem('token');

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setResults([]);
    setLoading(true);
    setSearched(true);

    if (!query.trim()) {
      setError('Please enter a search query');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/student/assistant/search',
        { query },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResults(response.data);
    } catch (err) {
      setError('Failed to search knowledge base');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-assistant">
      <h1>HMAS Assistant</h1>
      <p className="assistant-subtitle">Ask your questions and get instant answers</p>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-group">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type your question here..."
            className="search-input"
          />
          <button type="submit" disabled={loading} className="search-btn">
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {searched && (
        <div className="search-results">
          {loading ? (
            <p className="loading-text">Searching knowledge base...</p>
          ) : results.length === 0 ? (
            <div className="no-results">
              <p>No results found for your query.</p>
              <p className="no-results-hint">Try different keywords or contact support.</p>
            </div>
          ) : (
            <div className="qa-results">
              <h2>Results ({results.length})</h2>
              {results.map((result, index) => (
                <div key={result._id} className="qa-result">
                  <div className="result-number">{index + 1}</div>
                  <div className="result-content">
                    <div className="result-question">
                      <strong>Q:</strong> {result.question}
                    </div>
                    <div className="result-answer">
                      <strong>A:</strong> {result.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default StudentAssistant;

