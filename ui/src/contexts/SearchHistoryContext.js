import React, { createContext, useState, useContext } from 'react';

const SearchHistoryContext = createContext();

export const SearchHistoryProvider = ({ children }) => {
  const [searchHistory, setSearchHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const setSearchHistoryData = (data) => {
    setSearchHistory(data);
  };

  const updateSearchData = (term, start, end) => {
    setSearchTerm(term);
    setStartDate(start);
    setEndDate(end);
  };

  return (
    <SearchHistoryContext.Provider 
      value={{
        searchHistory,
        setSearchHistoryData,
        searchTerm,
        setSearchTerm,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        updateSearchData, // Provide the update function as well
      }}
    >
      {children}
    </SearchHistoryContext.Provider>
  );
};

export const useSearchHistory = () => {
  return useContext(SearchHistoryContext);
};
