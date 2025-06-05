import React, { useState, useEffect, useCallback } from 'react';
import '../styles/home.css';


const fetchCsrfToken = async () => {
  try {
    //const response = await fetch('http://localhost:8000/api/csrf-token/', {
    const response = await fetch('http://52.9.97.81:8000/api/csrf-token/', {
      method: 'GET',
      credentials: 'include',
    });
    const data = await response.json();
    return data.csrfToken;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    return null;
  }
};

function Search() {
  const [publication, setPublication] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [newsResults, setNewsResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(10);

  const today = new Date();
  const localDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());  // Local midnight
  const todayString = localDate.toISOString().split('T')[0];

  useEffect(() => {
    setStartDate(todayString);
    setEndDate(todayString);
  }, []);

  // Handle form input changes
  const handleSearchChange = (event) => setSearchTerm(event.target.value);
  const handleStartDateChange = (event) => setStartDate(event.target.value);
  const handleEndDateChange = (event) => setEndDate(event.target.value);
  const handleResultsPerPageChange = (event) => {
    setResultsPerPage(parseInt(event.target.value));
    setCurrentPage(1); // Reset to first page when changing results per page
  };

  const uniqueResults = Array.from(
    new Map(newsResults.map((article) => [article.url, article])).values()
  );

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const csrfToken = await fetchCsrfToken();
      if (!csrfToken) {
        console.error('Failed to fetch CSRF token');
        setLoading(false);
        return;
      }

      //const apiUrl = 'http://localhost:8000/api/search-news/';
      const apiUrl = 'http://52.6.97.91:8000/api/search-news/';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({
          keyword: searchTerm,
          publication: publication,
          startDate: startDate,
          endDate: endDate,
        }),
      });

      const data = await response.json();
      if (data && Array.isArray(data.results)) {
        setNewsResults(data.results);
      } else {
        setNewsResults([]);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  // Pagination Logic
  const totalPages = Math.ceil(uniqueResults.length / resultsPerPage);
  const indexOfLastResult = currentPage * resultsPerPage;
  const indexOfFirstResult = indexOfLastResult - resultsPerPage;
  const currentResults = uniqueResults.slice(indexOfFirstResult, indexOfLastResult);

  return (
    <div className="home-container">
      <div className="colored-bar-top">
        <h1 className="bar-text-top">DASH Hound<br />Media Metrics Collection Tool</h1>
      </div>
      <div className="bottom-bar-container">
        <button className="Clear-Button" onClick={() => window.location.reload()}>Clear</button>
      </div>
      <div className="colored-bar-middle">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <input
            type="text"
            placeholder="Search by keyword"
            value={searchTerm}
            onChange={handleSearchChange}
            className="input-field"
          />
          <input
            type="text"
            placeholder="Search by publication"
            value={publication}
            onChange={(e) => setPublication(e.target.value)}
            className="input-field"
          />
          <div className="date-range">
            <label htmlFor="startDate">Start Date:</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={handleStartDateChange}
              className="input-field"
            />
            <label htmlFor="endDate">End Date:</label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={handleEndDateChange}
              className="input-field"
            />
          </div>
          <div className="results-per-page">
            <label htmlFor="resultsPerPage">Results Per Page:</label>
            <select
              id="resultsPerPage"
              value={resultsPerPage}
              onChange={handleResultsPerPageChange}
              className="input-field"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <button type="submit" className="search-button">
            Search
          </button>
        </form>
      </div>
      <div className="colored-bar-bottom"></div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="news-results">
          <h2>Total Articles Found: {uniqueResults.length}</h2>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {currentResults.map((article, index) => (
              <li key={index} style={{ marginBottom: '20px' }}>
                <h3>{article.headline || 'No Title Available'}</h3>
                <p><strong>Author:</strong> {article.author || 'No Author Available'}</p>
                {article?.publication_name && (
                  <p><strong>Source:</strong> {article.publication_name}</p>
                )}
                <p><strong>Published:</strong> {article.date_of_broadcast ? new Date(article.date_of_broadcast).toLocaleDateString() : 'No Date Available'}</p>
                {article.image ? (
                  <img 
                    src={article.image} 
                    alt={article.headline} 
                    style={{ width: '350px', height: '175px', objectFit: 'cover' }} 
                  />
                ) : (
                  <p>No image available</p>
                )}
                <p>{article.subline || 'No Summary Available'}</p>
                <p><a href={article.url} target="_blank" rel="noopener noreferrer">Read more</a></p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Search;
