import React, { useEffect, useState } from 'react';

const GoogleNews = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  // This effect runs when the component mounts
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        // Replace this with your Django backend API endpoint
        const response = await fetch('http://52.6.97.91:8000/api/fetch_news/?searchTerm=The%20Oscars');
        
        // Check if the response is okay (status 200)
        if (response.ok) {
          const data = await response.json();
          setArticles(data.articles);  // Store the fetched articles in state
        } else {
          console.error('Failed to fetch news');
        }
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);  // Set loading to false once the request completes
      }
    };

    fetchArticles();  // Call the function to fetch articles
  }, []);  // Empty dependency array means this runs only once when the component mounts

  // Show a loading message while waiting for data
  if (loading) {
    return <div>Loading...</div>;
  }

  // Render the news articles once they are loaded
  return (
    <div>
      <h1>Google News Articles</h1>
      <ul>
        {articles.map((article, index) => (
          <li key={index}>
            <a href={article.link} target="_blank" rel="noopener noreferrer">
              <img src={article.image} alt={article.title} />
              <h2>{article.title}</h2>
            </a>
            <p>{article.source}</p>
            <p>{new Date(article.datetime).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GoogleNews;
