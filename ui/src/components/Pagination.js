import React from 'react';

const Pagination = ({ currentPage, totalArticles, resultsPerPage, setCurrentPage }) => {
  // Calculate total pages only once
  const totalPages = Math.ceil(totalArticles / resultsPerPage);

  // Generate pagination buttons
  const getPaginationButtons = () => {
    const buttons = [];

    // Add "Previous" button if we're not on the first page
    if (currentPage > 1) {
      buttons.push(
        <button key="prev" onClick={() => setCurrentPage(currentPage - 1)} className="pagination-button">
          Previous
        </button>
      );
    }

    // Calculate range of pages to display
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    // Add page buttons within the range
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button 
          key={i} 
          className={`pagination-button ${currentPage === i ? 'active' : ''}`}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </button>
      );
    }

    // Add "Next" button if we're not on the last page
    if (currentPage < totalPages) {
      buttons.push(
        <button key="next" onClick={() => setCurrentPage(currentPage + 1)} className="pagination-button">
          Next
        </button>
      );
    }

    return buttons;
  };

  return (
    <div className="pagination-buttons">
      {getPaginationButtons()}
    </div>
  );
};

export default Pagination;
