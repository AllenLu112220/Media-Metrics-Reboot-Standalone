
const CurrentsAPI = require('currentsapi');
const currentsapi = new CurrentsAPI('yujFLfzZuqpi8AenB-_aW_nMCNUx9r3XOq8t6YT_RlGb_u_d');

// Set your start and end date
const startDate = '2025-01-01'; // Format: YYYY-MM-DD
const endDate = '2025-02-01';   // Format: YYYY-MM-DD

currentsapi.search({
  keywords: 'Trump',
  language: 'en',
  country: 'US',
  page_size: 100,
  from: startDate,    // Add the start date
  to: endDate         // Add the end date
}).then(response => {
  console.log(response);
  
  // Check if the response status is ok
  if (response.status === "ok") {
    console.log(`Total articles found: ${response.news.length}`);
  } else {
    console.log("No results found or error in response.");
  }
  /*
    Example output:
    {
      status: "ok",
      news: [...],
      totalArticles: 100
    }
  */
}).catch(error => {
  console.error("Error: ", error);
});
