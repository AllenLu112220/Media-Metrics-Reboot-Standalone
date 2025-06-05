const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('f62f5002487a40d0b484b9ecad251a33');

newsapi.v2.everything({
  q: 'dogs', // Replace with your keyword
  from: '2025-02-15', // Replace with your desired start date (YYYY-MM-DD)
  to: '2025-02-16', // Replace with your desired end date (YYYY-MM-DD)
  language: 'en', // Fetch only English articles
  sortBy: 'publishedAt', // Sort results by publish date
  page: 1 // Fetch the first page of results
}).then(response => {
    // Transform the NewsAPI response to match your format
    const formattedArticles = response.articles.map(article => ({
      author: article.author || 'Unknown',  // Set default if author is missing
      category: 'general',  // Modify or set as needed
      country: 'us',  // Set the country as needed or dynamically fetch it
      description: article.description,
      image: article.urlToImage,
      language: article.language || 'en',  // Use default 'en' if language is missing
      published_at: article.publishedAt,
      source: article.source.name,
      title: article.title,
      url: article.url
    }));
  
    console.log(formattedArticles);
  }).catch(error => {
    console.error('Error fetching news:', error);
  });


  