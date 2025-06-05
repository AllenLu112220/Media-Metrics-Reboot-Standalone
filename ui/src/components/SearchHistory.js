  import React, { useEffect, useState, useCallback } from 'react';
  import { useUser } from '../contexts/UserContext';
  import { useSearchHistory } from '../contexts/SearchHistoryContext'; // Import context
  import { useNavigate } from 'react-router-dom'
  import '../styles/SearchHistory.css';

  function SearchHistory({ setQuery, setStartDate, setEndDate, onSelect }) {
    const { user } = useUser();
    const { setSearchHistoryData, updateSearchData } = useSearchHistory(); // Access function to update context
    const [searchHistory, setSearchHistory] = useState([]);
    const navigate = useNavigate();

    const fetchSearchHistory = useCallback(async () => {
      try {
        if (!user) {
          throw new Error('User not logged in');
        }

        const csrfToken = await fetchCsrfToken();
        
        //const response = await fetch('http://localhost:8000/api/search-history/', {
        const response = await fetch('http://52.6.97.91:8000/api/search-history/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
          },
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          data.sort((a, b) => b.query_id - a.query_id);
          setSearchHistory(data);
          setSearchHistoryData(data); 
        } else {
          console.error('Error fetching search history:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching search history:', error);
      }
    }, [user, setSearchHistoryData]);

    useEffect(() => {
      if (user) {
        fetchSearchHistory();
      }
    }, [user, fetchSearchHistory]);

    const fetchCsrfToken = async () => {
      //const response = await fetch('http://localhost:8000/api/csrf-token/', { method: 'GET', credentials: 'include' });
      const response = await fetch('http://52.6.97.91:8000/api/csrf-token/', { method: 'GET', credentials: 'include' });
      const data = await response.json();
      return data.csrfToken;
    };

    const handleSelect = (search) => {
      // Navigate directly to the SearchForm route
      console.log('Navigating to Home with search data:', search);
      navigate('/home', { state: search });

    };
    

    return (
      <div>
        <h1 style={{ textAlign: 'center' }}>Search History</h1>
        <table style={{ width: '70%', fontSize: '0.8rem', margin: 'auto', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <thead>
            <tr style={{ backgroundColor: '#f4f4f4' }}>
              <th style={{ padding: '6px', borderBottom: '1px solid #ddd', width: '40%' }}>Keyword</th>
              <th style={{ padding: '6px', borderBottom: '1px solid #ddd', width: '30%' }}>Start Date</th>
              <th style={{ padding: '6px', borderBottom: '1px solid #ddd', width: '30%' }}>End Date</th>
              <th style={{ padding: '6px', borderBottom: '1px solid #ddd', width: '10%' }}>Select Past Search</th>
            </tr>
          </thead>
          <tbody>
            {searchHistory.length > 0 ? (
              searchHistory.map((search, index) => (
                <tr key={index} style={{ textAlign: 'center' }}>
                  <td style={{ padding: '5px', borderBottom: '1px solid #ddd' }}>{search.keyword}</td>
                  <td style={{ padding: '5px', borderBottom: '1px solid #ddd' }}>{search.start_date}</td>
                  <td style={{ padding: '5px', borderBottom: '1px solid #ddd' }}>{search.end_date}</td>
                  <td style={{ padding: '5px', borderBottom: '1px solid #ddd' }}>
                    <button onClick={() => handleSelect(search)}>
                      Select
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ padding: '10px', textAlign: 'center' }}>No search history available.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }

  export default SearchHistory;
