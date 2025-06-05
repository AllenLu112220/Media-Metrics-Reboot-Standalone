//serpAPI.js
export const fetchSerpAPI = async (query, startDate = "", endDate = "") => {
  try {
    // Construct the correct tbs parameter only if both dates exist
    const tbsParam = startDate && endDate 
      ? `cdr:1,cd_min:${encodeURIComponent(startDate)},cd_max:${encodeURIComponent(endDate)}`
      : "";

    //const apiUrl = `http://localhost:8000/api/serp?q=${encodeURIComponent(query)}&tbm=nws${tbsParam ? `&tbs=${tbsParam}` : ""}`;
    const apiUrl = `http://52.6.97.91:8000/api/serp?q=${encodeURIComponent(query)}&tbm=nws${tbsParam ? `&tbs=${tbsParam}` : ""}`;
    console.log("Fetching from SerpAPI with URL:", apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',  // Use GET to match backend's request handling
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();
    console.log("Raw API Response:", data);

    if (!data.news_results) {
      console.warn("No news_results found in response");
      return [];
    }

    // Extract stories from the response
    const articles = [
      ...(data.news_results || []), // Direct news results (if they exist)
      ...(data.top_stories || []),
      ...(data.organic_results || []),
      ...(data.related_searches || []),
      ...(data.people_also_search_for
        ? data.people_also_search_for.flatMap(section => section.news_results || [])
        : [])
    ];

    return articles.map((story) => ({
      author: story.source?.authors?.join(", ") || null,  
      category: story.categories?.join(", ") || "",      
      country: story.source?.country || "us",             
      description: story.snippet || null,             
      image: story.thumbnail || null,                     
      language: story.language || "en",                   
      published_at: new Date(story.date).toISOString() || null,  
      source: story.source?.name || null,                 
      title: story.title || null,                       
      url: story.link || null  
    }));
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
};
