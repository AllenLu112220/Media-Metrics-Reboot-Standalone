import React from 'react';

const NewsResults = ({
  news = [],
  currentPage,
  resultsPerPage,
  totalArticles,
  getPaginationButtons,
  selectedCategory,
}) => {
  // Log the selected category
  console.log('Selected Category:', selectedCategory);

  // Filter news based on the selected category
  const filteredNews = selectedCategory
    ? news.filter((article) => {
        // Log the article's categories to see what categories are being checked
        console.log('Article Categories:', article.categories);
        
        // Check if the article's categories include the selected category
        const isCategoryMatch = article.categories?.includes(selectedCategory);
        
        // Log the result of the category check
        console.log('Category Match:', isCategoryMatch);
        
        return isCategoryMatch;
      })
    : news;

  const lastIndex = currentPage * resultsPerPage;
  const lastArticle = lastIndex >= totalArticles ? totalArticles - 1 : lastIndex - 1;

  return (
    <div className="news-results">
      <p>Total Articles Found: {filteredNews.length}</p>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {filteredNews
          .slice((currentPage - 1) * resultsPerPage, currentPage * resultsPerPage)
          .map((article, index) => {
            return (
              <li key={index} style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '17px' }}>{article.title}</h3>

                {(article.image || article.thumbnail) && (
                  <img
                    src={article.image || article.thumbnail}
                    alt={article.title}
                    style={{ width: '350px', height: '175px', objectFit: 'cover' }}
                  />
                )}

                <p>
                  <span>{article.author || ''}</span>
                  {article.published_at &&
                    ` ${new Date(article.published_at).toISOString().split('T')[0]}`}
                  {article.date}
                </p>

                {(article?.name || article?.source?.name) && (
                  <p>Source: {article.name || article.source.name}</p>
                )}
                <br />

                <p>{article.description || article.snippet}</p>
                <p>
                  {article.url || article.link ? (
                    <a href={article.url || article.link} target="_blank" rel="noopener noreferrer">
                      Read more
                    </a>
                  ) : (
                    <span>No link available</span>
                  )}
                </p>

                <div>
                  {/* Only display categories if it's an array */}
                  {Array.isArray(article.categories) && article.categories.length > 0
                    ? article.categories.join(', ')  // If it's an array, join them
                    : 'No categories available'}
                </div>

                {index === lastArticle && <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>}
              </li>
            );
          })}
      </ul>
      <div className="pagination-buttons">{getPaginationButtons()}</div>
    </div>
  );
};

export default NewsResults;
