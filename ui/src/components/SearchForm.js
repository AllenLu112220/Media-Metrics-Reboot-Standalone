import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../contexts/UserContext';
import { useLocation } from 'react-router-dom';

import '../styles/SearchForm.css';

const SearchForm = ({
  searchTerm,
  category,
  handleSearchChange,
  handleCategoryChange,
  handleSearchSubmit,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
}) => {
  const location = useLocation();
  const [query, setQuery] = useState(searchTerm);
  const [isOpen, setIsOpen] = useState(true);
  const popupRef = useRef(null);
  const { isLoggedIn } = useUser();

  useEffect(() => {
    if (location.state) {
      console.log('New data received, resetting form:', location.state);
      setQuery('');
      setStartDate('');
      setEndDate('');
      setTimeout(() => {
        setQuery(location.state.keyword || '');
        setStartDate(location.state.start_date || '');
        setEndDate(location.state.end_date || '');
      }, 0);
    }
  }, [location.state]);

  const inputRef = useRef(null);

  const formatQuery = (query) => {
    return query.replace(/\bNOT\b/g, '-').replace(/\bAND\b/g, ' ').replace(/\bOR\b/g, ',');
  };

  const insertOperator = (operator) => {
    const input = inputRef.current;
    if (!input) return;
  
    const start = input.selectionStart;
    const end = input.selectionEnd;
  
    if (["AND", "OR", "NOT"].includes(operator)) {
      const textBefore = query.substring(0, start);
      const textAfter = query.substring(end);
      const newQuery = `${textBefore} ${operator} ${textAfter}`;
      
      setQuery(newQuery);
      setTimeout(() => {
        input.focus();
        input.selectionStart = input.selectionEnd = start + operator.length + 2; // Move the cursor after the operator
      }, 0);
      return;
    }
  
    // Handle quotes operator
    if (operator === '""') {
      if (start === end) {
        const textBefore = query.substring(0, start);
        const match = textBefore.match(/(\S+)$/);
        if (match) {
          const wordStart = start - match[0].length;
          const newQuery =
            query.substring(0, wordStart) +
            `"${match[0]}"` +
            query.substring(end);
          setQuery(newQuery);
          setTimeout(() => {
            input.focus();
            input.selectionStart = input.selectionEnd = wordStart + match[0].length + 2;
          }, 0);
          return;
        }
      } else {
        const selected = query.substring(start, end);
        const newQuery =
          query.substring(0, start) + `"${selected}"` + query.substring(end);
        setQuery(newQuery);
        setTimeout(() => {
          input.focus();
          input.selectionStart = input.selectionEnd = end + 2;
        }, 0);
        return;
      }
    }
  
    const newQuery = query.substring(0, start) + operator + query.substring(end);
    setQuery(newQuery);
  
    setTimeout(() => {
      input.focus();
      input.selectionStart = input.selectionEnd = start + operator.length;
    }, 0);
  };

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSearch = () => {
    const today = new Date();
    const defaultEndDate = today.toISOString().split("T")[0];

    const pastDate = new Date();
    pastDate.setDate(today.getDate() - 29);
    const defaultStartDate = pastDate.toISOString().split("T")[0];

    const finalStartDate = startDate || defaultStartDate;
    const finalEndDate = endDate || defaultEndDate;

    if (query.trim()) {
      handleSearchSubmit(formatQuery(query.trim()), category, finalStartDate, finalEndDate);
      setIsOpen(false); // Close the popup after search
    }
  };

  useEffect(() => {
    if (query.trim()) {
      sessionStorage.setItem('searchQuery', query);
    }
  }, [query]);

  useEffect(() => {
    const savedQuery = sessionStorage.getItem('searchQuery');
    if (savedQuery) {
      setQuery(savedQuery);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <>
      <button className="search-button" onClick={() => setIsOpen(!isOpen)}>
        Search For Articles
      </button>
      {isOpen && (
        <div className="search-popup" ref={popupRef}>
          <button className="close-button" onClick={() => setIsOpen(false)}>
            ×
          </button>
          <input
            type="text"
            placeholder="Enter search query"
            value={query}
            onChange={handleQueryChange}
            ref={inputRef}
            className="query-input"
          />
          <div className="operator-buttons">
            <button onClick={() => insertOperator('AND')} data-tooltip="Returns results that include both terms.">AND</button>
            <button onClick={() => insertOperator('OR')} data-tooltip="Returns results that include either term.">OR</button>
            <button onClick={() => insertOperator('NOT')} data-tooltip="Excludes results containing this term.">NOT</button>
            <button onClick={() => insertOperator('""')} data-tooltip='Search for an exact phrase.'>“Quote”</button>
            <button onClick={() => insertOperator('(')} data-tooltip="Group terms together.">(</button>
            <button onClick={() => insertOperator(')')} data-tooltip="Close a grouped expression.">)</button>
          </div>
          <div className="date-range-container">
          <p>
            Note: Search can only include articles published within one <br />
            <span style={{ paddingLeft: '0px' }}>month from today's date.</span>
          </p>
            <label>Date Range:</label>
            <div className="date-range-fields">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <span className="date-separator"> — </span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <select value={category} onChange={handleCategoryChange}>
            <option value="">Select category</option>
            <option value="Culture">Culture</option>
            <option value="Crime and Justice">Crime and Justice</option>
            <option value="Economy">Economy</option>
            <option value="Education">Education</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Environment">Environment</option>
            <option value="Financial/Business">Financial/Business</option>
            <option value="Health and Wellness">Health and Wellness</option>
            <option value="Industry">Industry</option>
            <option value="Innovation">Innovation</option>
            <option value="Lifestyle">Lifestyle</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Politics/Government">Politics/Government</option>
            <option value="Retail">Retail</option>
            <option value="Science">Science</option>
            <option value="Social Responsibility">Social Responsibility</option>
            <option value="Sports">Sports</option>
            <option value="Technology">Technology</option>
            <option value="Weather">Weather</option>
            <option value="World News">World News</option>
          </select>
          <div className="search-button-container">
            <button onClick={handleSearch} disabled={!isLoggedIn}>
              Search
            </button>
            {!isLoggedIn && <span className="tooltip">You must be logged in to search</span>}
          </div>
        </div>
      )}
    </>
  );
};

export default SearchForm;