import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useUser } from '../contexts/UserContext';
import SearchForm from '../components/SearchForm';  // Import SearchForm
import NewsResults from '../components/NewsResults'; // Import NewsResults
import Pagination from '../components/Pagination'; // Import Pagination
import '../styles/home.css';
import '../styles/SearchForm.css';



const fetchCsrfToken = async () => {
  const response = await fetch('http://52.6.97.91:8000/api/csrf-token/', { method: 'GET', credentials: 'include' });
  //const response = await fetch('http://localhost:8000/api/csrf-token/', { method: 'GET', credentials: 'include' });
  const data = await response.json();
  return data.csrfToken;
}


function safeDecodeHTML(text) {
  if (!text || !text.includes('&')) return text; // Skip decoding if no encoded characters
  const doc = new DOMParser().parseFromString(text, "text/html");
  return doc.body.textContent || "";
}


function Home({news, setNews, children}) {
 const today = new Date();
  const localDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());  // Local midnight
  const todayString = localDate.toISOString().split('T')[0];

  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('');
  const [showNewsletter, setShowNewsletter] = useState(false);
  const [showForum, setShowForum] = useState(false);
  const [showBlog, setShowBlog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [totalArticles, setTotalArticles] = useState(0); // State to hold the total number of articles
  const [resultsPerPage, setResultsPerPage] = useState(10); // Default results per page
  const [currentPage, setCurrentPage] = useState(1); // State for current page
  const { user } = useUser();
  const userID = user ? user.userID : null;
  const [file, setFile] = useState(null);

  const articleType = showBlog ? 'Blog' : showForum ? 'Forum' : showNewsletter ? 'Newsletter' : 'All';

  const handleSearchChange = (event) => setSearchTerm(event.target.value);
  const handleStartDateChange = (event) => setStartDate(event.target.value);
  const handleEndDateChange = (event) => setEndDate(event.target.value);
  const handleCategoryChange = (event) => setCategory(event.target.value);
  
  const handleResultsPerPageChange = (event) => {
    setResultsPerPage(parseInt(event.target.value));
    setCurrentPage(1);
  };

  const parseDate = (dateStr) => {
    const parts = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4}), (\d{1,2}):(\d{2}) (AM|PM), ([+-]\d{4}) UTC/);
    if (parts) {
      const [_, month, day, year, hour, minute, period, offset] = parts;
      const formattedDate = `${year}-${month}-${day}T${hour}:${minute}:00${offset}`;
      return new Date(formattedDate).toISOString();
    }
    return null;  
  };

  const toggleNewsletter = () => setShowNewsletter(!showNewsletter);
  const toggleForum = () => setShowForum(!showForum);
  const toggleBlog = () => setShowBlog(!showBlog);

  const getPaginationButtons = useCallback(() => {
    const totalPages = Math.ceil(totalArticles / resultsPerPage);
    const buttons = [];

    if (currentPage > 1) {
      buttons.push(
        <button key="prev" onClick={() => setCurrentPage(currentPage - 1)} className="pagination-button">
          Previous
        </button>
      );
    }
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

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

    if (currentPage < totalPages) {
      buttons.push(
        <button key="next" onClick={() => setCurrentPage(currentPage + 1)} className="pagination-button">
          Next
        </button>
      );
    }

    return buttons;
  }, [currentPage, totalArticles, resultsPerPage]);

const handleSearchSubmit = async (query, selectedCategory, startDate, endDate) => {
	
  console.log('Search term:', query);
  console.log('Selected Category:', selectedCategory);
  if (!userID || !query) return; // Ensure user is logged in and search term is provided

  setLoading(true);
  const apiKey = '0621be6e121a1d131192de7f752cdf10';
  const limit = 100; // Maximum results per request
  const maxResults = 200; // Max results to retrieve
  let allNews = [];
  let newsAPIArray = [];
  let offset = 0;

  const category = '';  
  const publication = category || '';
  
  // Format dates to yyyy-mm-dd
  const formattedStartDate = startDate ? new Date(startDate).toISOString().split('T')[0] : '';
  const formattedEndDate = endDate ? new Date(endDate).toISOString().split('T')[0] : '';

  
  console.log('Start Date:', formattedStartDate);
  console.log('End Date:', formattedEndDate);
  
  

  // Fetch news articles with pagination
  try {
	  
	  
      const csrfToken = await fetchCsrfToken();
      if(!csrfToken){
        console.error("Failed to fetch CSRF token");
        setLoading(false);
        return;
      }
      const today = new Date(); //Always use the current date dynamically
      const past30Days = new Date();
      past30Days.setDate(today.getDate() - 28); 

      let adjustedStartDate = new Date(startDate);
      let adjustedEndDate = new Date(endDate)

      if (adjustedEndDate < past30Days) {
        console.warn(`Date range (${startDate} - ${endDate}) is outside the last 30 days. Skipping API call.`);
        return;
      }

      if (adjustedStartDate < past30Days) {
        console.warn(`Start date (${startDate}) is beyond 30 days. Adjusting to: ${past30Days.toISOString().split('T')[0]}`);
        adjustedStartDate = past30Days;
      
      }

      const formattedStartDate = adjustedStartDate.toISOString().split('T')[0];
      const formattedEndDate = adjustedEndDate.toISOString().split('T')[0];

      //const url = `http://localhost:8000/api/get_news/?q=${query}&startDate=${formattedStartDate}&endDate=${formattedEndDate}`;
      const url = `http://52.6.97.91:8000/api/get_news/?q=${query}&startDate=${formattedStartDate}&endDate=${formattedEndDate}`;
      console.log('Request URL:', url); 

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        credentials: 'include', // Ensure cookies are included if CSRF token is in use
      });
      if (!response.ok) {
        throw new Error('Failed to fetch articles from the backend');
      }
      const contentType = response.headers.get('Content-Type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log('Fetched articles Backend', data); // Log only when everything looks good
        if (data && data.all_articles && Array.isArray(data.all_articles)) {
          newsAPIArray = data.all_articles.map(article => ({
            author: article.author || article.source?.name || null,  
            category: article.category || category,  // Default to 'general' if category is not provided
            country: article.country || 'us',  // Assuming 'us' as default
            description: article.description || '',
            image: article.urlToImage || null,  // If no image is provided, use null
            language: 'en',  
            published_at: article.publishedAt || '',
            source: article.source?.name || article.source?.id || '',  
            title: article.title || '',
            url: article.url || '',
          }));
		  
		  console.log('Formatted NewsAPI articles:', JSON.stringify(newsAPIArray, null, 2));
;
        } else {
          console.error('No articles found in the response');
        }
        
      } else {
        console.error('Expected JSON response but got:', contentType);
      }

      const currentsUrl = `http://52.6.97.91:8000/api/fetch_CurrentsAPI_news/?q=${query}&startDate=${formattedStartDate}&endDate=${formattedEndDate}`;  
      //const currentsUrl = `http://localhost:8000/api/fetch_CurrentsAPI_news/?q=${query}&startDate=${formattedStartDate}&endDate=${formattedEndDate}`;  
      console.log('Requesting CurrentsAPI news:', currentsUrl);

      const csrfTokenCurrents = await fetchCsrfToken();
      let currentsAPIarray = [];
      try{
        const currentsResponse = await fetch(currentsUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfTokenCurrents,
          },
          credentials: 'include',
        });

        if (!currentsResponse.ok) {
          throw new Error('Failed to fetch CurrentsAPI news');
        }
        

        const currentsData = await currentsResponse.json();
        console.log('Fetched articles Currents:', currentsData);


        if (currentsData && currentsData.articles && Array.isArray(currentsData.articles)) {
          // Store the articles in the currentsAPIarray
          const currentsAPIarray = currentsData.articles;  // Store articles directly
          console.log('currentsAPIarray:', currentsAPIarray);
        } else {
          console.log('No articles found or invalid response format');
        }
      
      } catch (apiError) {
        console.error('Error fetching CurrentsAPI news:', apiError);
      }
      
      
      
      //const apiUrl = 'http://52.6.97.91:8000/api/search-news/'
       /* const apiUrl = 'http://localhost:8000/api/search-news/';
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
          },
          credentials: 'include',
          body: JSON.stringify({
            keyword: query,
            publication: publication,
            startDate: startDate,
            endDate: endDate,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch articles from the database');
        } 

    
      const dbArticlesData = await response.json();
      console.log('Received articles:', dbArticlesData);
      const dbArticles = dbArticlesData.results || [];
      console.log('Articles:', dbArticles); 

      const standardizedDbArticles = dbArticles.map(article => ({
        author: article.author || 'Unknown Author',  
        published_at: article.date_of_broadcast,    
        title: article.headline,                    
        description: article.subline,               
        image: article.image || null,               
        url: article.url,                           
        source: article.publication_name,           
      }));

      //allNews = [...standardizedDbArticles];*/

    while (allNews.length < maxResults) {
      // Conditionally include date range in the URL
      let url = `http://api.mediastack.com/v1/news?access_key=${apiKey}&keywords=${encodeURIComponent(query)}&countries=us&limit=${limit}&offset=${offset}&sort=published_desc`;
      if (formattedStartDate && formattedEndDate) {
        url += `&date=${formattedStartDate},${formattedEndDate}`;
      }
	  
	  //log to see what api call looks like
	    console.log('Fetching API with URL:', url);

      const fetchPromise = fetch(url).then(response => response.json());


      try {
        const data = await fetchPromise;
        if (!data || !data.data || data.data.length === 0) {
          console.error('No articles returned from the API, breaking the loop.');
          break; // No more data available, stop the loop.
        }
    
        allNews = [...allNews, ...(data.data || [])];
        console.log('Fetched articles MediaStack:', allNews);
    
        // Stop if the number of articles fetched is less than the limit (indicating the end of the results)
        if (data.data.length < limit) {
          console.log('Fetched fewer articles than the limit, stopping the loop.');
          break;
        }
    
        // If the maximum results limit is reached, break out of the loop
        if (allNews.length >= maxResults) {
          console.log('Max results reached, stopping the loop.');
          break;
        }
    
        // Increment the offset to fetch the next set of results
        offset += limit;
    
      } catch (error) {
        console.error('Error fetching articles:', error);
        break;
      }
    }
      allNews = [...allNews, ...newsAPIArray]
      allNews = [...allNews, ...currentsAPIarray]
    
    // Fetch articles from SerpAPI
    try {
      //const serpApiUrl = `http://localhost:8000/api/serp?q=${encodeURIComponent(query)}&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;
      const serpApiUrl = `http://52.6.97.91:8000/api/serp?q=${encodeURIComponent(query)}&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;

      console.log('Fetching from SerpAPI with URL:', serpApiUrl);

      const serpResponse = await fetch(serpApiUrl);
  
      if (!serpResponse.ok) {
        throw new Error('Failed to fetch from SerpAPI');
      }

      const serpData = await serpResponse.json();
      console.log('SerpAPI response:', serpData);
    // Process and map the articles
      const mappedArticles = (serpData.news_results || []).map((story) => ({
        author: story.source?.authors?.join(", ") || null,  
        category: story.categories?.join(", ") || "",      
        country: story.source?.country || "us",             
        description: story.snippet || null,             
        image: story.thumbnail || null,                     
        language: story.language || "en",                   
        published_at: (() => {
            const rawDate = story.date;
            if (!rawDate) return null;

            // Remove ", +0000 UTC" and extra comma before parsing
            const cleanedDate = rawDate.replace(", +0000 UTC", "").replace(",", "");
            const parsedDate = Date.parse(cleanedDate);

            return isNaN(parsedDate) ? null : new Date(parsedDate).toISOString();
        })(),
        source: story.source?.name || null,                 
        title: story.title || null,                       
        url: story.link || null  
      }));

      console.log('Fetched articles SerpAPI:',mappedArticles)

      // Append SerpAPI results to the articles list
      allNews = [...allNews, ...mappedArticles];
	  
	  const categorizedArticles = categorizeArticles(allNews); // Add categories

		// Set the categorized articles to state or process them further
	 setNews(categorizedArticles);
	 
    } catch (error) {
      console.error('Error fetching from SerpAPI:', error);
    }

    allNews = allNews.map(article=> ({
		...article,
		description:safeDecodeHTML(article.description),
	}))
	
	setNews(allNews);
	

	// Now categorize articles using categorizeArticles function
	allNews = categorizeArticles(allNews); // Categorize the articles and overwrite allNews
	let filteredArticles = filterArticlesByCategory(allNews, category); // Apply the category filter
	setNews(filteredArticles);
	console.log('Filtered and Categorized News Array:', JSON.stringify(filteredArticles, null, 2));
	setTotalArticles(filteredArticles.length);
	setLoading(false);
	


    console.log('Categorized Articles:', allNews);
		
	} catch (error) {
		console.error('Error fetching news:', error);
		} finally {
			setLoading(false);
	}
	console.log("News State Before Rendering:", news);
	// Save search query and articles to the database
  try {
  const csrfToken = await fetchCsrfToken();
 

  // Prepare the request payload
  const payload = {
      keyword: query,
      user_id: userID,
      date_queried: new Date().toISOString().split('T')[0], // Current date in 'yyyy-MM-dd'
      date_range_button: 'NA', 
      start_date: formattedStartDate,
      end_date: formattedEndDate,
      category: selectedCategory,
      article_type: articleType
    };

  // Log the payload to verify its content
  console.log("Request Payload:", payload);

  const saveQueryResponse = await fetch('http://52.6.97.91:8000/api/save-search/', {
  //const saveQueryResponse = await fetch('http://localhost:8000/api/save-search/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken
      },
      credentials: 'include',
      body: JSON.stringify(payload)
    });

    if (!saveQueryResponse.ok) {
      throw new Error('Failed to save search query');
    }

    const saveQueryData = await saveQueryResponse.json();
    const queryID = saveQueryData.query_id;

    console.log('Articles being sent:', JSON.stringify({
      query_id: queryID,
      articles: allNews,
      article_type: articleType
    }, null, 2));

    // Save articles to the database
    const saveArticlesResponse = await fetch('http://52.6.97.91:8000/api/save-articles/', {
    //const saveArticlesResponse = await fetch('http://localhost:8000/api/save-articles/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken
      },
      credentials: 'include',
      body: JSON.stringify({
        query_id: queryID,
        articles: allNews,
        article_type: articleType,
      })
    });

    if (!saveArticlesResponse.ok) {
      throw new Error('Failed to save articles');
    }

    const saveData = await saveArticlesResponse.json();
    console.log('Articles saved successfully:', saveData.message);
  } catch (error) {
    console.error('Error saving search query or articles:', error);
  }
};

function categorizeArticles(articles) {
  const categories = {
	  "Politics/Government": [
		"election", "senate", "congress", "policy", "diplomacy", "government", "president", "law", "campaign", "vote",
		"legislation", "parliament", "minister", "democracy", "republic", "state", "authority", "governor", "regulation", "justice",
		"political party", "immigration", "senator", "voter turnout", "governance", "lobbying", "referendum", "impeachment", "constitution", "cabinet",
		"federal", "bipartisan", "coalition", "constituency", "ballot", "mandate", "policy reform", "governance reform", "civil rights", "public service",
		"political debate", "electoral college", "suffrage", "ideology", "scandal", "state affairs", "oversight", "public policy", "legislative session", "electorate"
	  ],
	  "Financial/Business": [
		"stock", "market", "investment", "finance", "economy", "trade", "entrepreneur", "startup", "banking", "revenue",
		"profit", "merger", "acquisition", "capital", "cryptocurrency", "IPO", "dividend", "portfolio", "funding", "tax",
		"inflation", "interest rate", "shares", "debt", "venture capital", "business strategy", "economic policy", "fiscal policy", "balance sheet", "market analysis",
		"financial forecast", "stock exchange", "investment bank", "asset management", "hedge fund", "private equity", "cash flow", "liquidity", "corporate governance", "merger and acquisition",
		"market volatility", "risk management", "financial crisis", "economic growth", "financial stability", "credit rating", "profit margin", "business innovation", "startup ecosystem", "market capitalization"
	  ],
	  "Health and Wellness": [
		"health", "fitness", "diet", "mental health", "therapy", "vaccine", "pandemic", "nutrition", "exercise", "medicine",
		"wellness", "clinic", "doctor", "hospital", "virus", "yoga", "meditation", "disease", "surgery", "immunity",
		"mental wellness", "healthy lifestyle", "physical therapy", "healthcare", "preventive care", "epidemic", "wellbeing", "medications", "chronic disease", "holistic health",
		"alternative medicine", "stress management", "medical research", "clinical trial", "public health", "immunization", "fitness tracker", "mental fitness", "self-care", "organic food",
		"exercise routine", "health supplement", "diet plan", "body mass", "heart health", "wellness program", "nutritionist", "medical innovation", "rehabilitation", "health insurance"
	  ],
	  "Technology": [
		"AI", "blockchain", "cybersecurity", "robotics", "software", "hardware", "internet", "gadgets", "programming", "data science",
		"cloud", "VR", "AR", "IoT", "machine learning", "startup", "tech", "innovation", "automation", "apps",
		"artificial intelligence", "big data", "quantum computing", "5G", "digital transformation", "coding", "networking", "smart technology", "app development", "wearable tech",
		"tech startup", "cybersecurity breach", "computer science", "data analytics", "augmented reality", "virtual reality", "digital innovation", "tech industry", "semiconductor", "IT infrastructure",
		"cloud computing", "edge computing", "software development", "mobile technology", "fintech", "smart devices", "cybersecurity policy", "internet of things", "digital security", "technology trends"
	  ],
	  "Science": [
		"research", "discovery", "biology", "chemistry", "physics", "space", "astronomy", "genetics", "environment", "ecology",
		"climate", "geology", "neuroscience", "AI", "experiment", "laboratory", "scientist", "robotics", "evolution", "nanotechnology",
		"fossils", "planetary science", "gene editing", "stem cells", "bioengineering", "microbiology", "artificial life", "synthetic biology", "astrophysics", "quantum mechanics",
		"particle physics", "chemical reaction", "scientific method", "research paper", "scientific discovery", "space exploration", "genetic engineering", "scientific breakthrough", "biology research", "climate science",
		"evolutionary biology", "lab experiment", "scientific innovation", "physics experiment", "scientific theory", "research funding", "data analysis", "scientific community", "experimental design", "laboratory equipment"
	  ],
	  "Economy": [
		"GDP", "inflation", "unemployment", "recession", "deflation", "interest rates", "monetary policy", "fiscal policy", "global economy", "trade balance",
		"economic growth", "consumer confidence", "budget deficit", "inflation rate", "economic forecast", "financial stability", "economic recovery", "currency exchange", "supply chain", "economic inequality",
		"macroeconomics", "national debt", "labor market", "job creation", "economic stability", "financial crisis", "economic policy", "public debt", "economic indicators", "market trends",
		"fiscal deficit", "economic reform", "trade policy", "economic slowdown", "gross national product", "consumer spending", "economic diversification", "economic resilience", "employment rate", "real estate market",
		"business cycle", "investment climate", "economic integration", "economic competitiveness", "trade negotiations", "global trade", "industrial output", "price stability", "economic development", "government spending"
	  ],
	  "Industry": [
		"manufacturing", "automation", "supply chain", "logistics", "energy", "construction", "mining", "textiles", "pharmaceuticals", "chemicals",
		"equipment", "distribution", "retail", "wholesale", "transportation", "petroleum", "renewable energy", "industrial revolution", "innovation", "materials science",
		"steel production", "electric vehicles", "green energy", "supply chain disruption", "logistics technology", "workforce automation", "resource management", "industrial engineering", "production line", "heavy machinery",
		"factory automation", "industrial design", "production capacity", "industrial output", "energy efficiency", "manufacturing process", "industrial maintenance", "quality control", "operational efficiency", "industrial robotics",
		"industrial investment", "plant operations", "industrial safety", "manufacturing technology", "process optimization", "smart manufacturing", "industrial automation", "production management", "factory floor", "industrial innovation"
	  ],
	  "Retail": [
		"shopping", "consumer", "e-commerce", "online retail", "store", "mall", "shopping cart", "consumer behavior", "customer service", "retail trends",
		"supply chain", "branding", "advertising", "discounts", "promotion", "marketplace", "sales", "inventory", "wholesale", "fashion",
		"customer experience", "retail marketing", "brick-and-mortar", "consumer electronics", "luxury goods", "direct-to-consumer", "personalized shopping", "point of sale", "retail analytics", "shopping experience",
		"product display", "retail strategy", "online marketplace", "retail technology", "store layout", "retail management", "shopper insights", "omni-channel", "customer loyalty", "retail innovation",
		"seasonal sales", "market segmentation", "retail expansion", "brand identity", "in-store promotions", "inventory management", "digital retail", "customer retention", "retail operations", "e-commerce platform"
	  ],
	  "Crime and Justice": [
		"crime", "law enforcement", "court", "trial", "justice", "prison", "criminal", "investigation", "lawyer", "punishment",
		"lawsuit", "crime rate", "police", "victim", "criminal justice", "prosecution", "sentencing", "legal system", "human rights", "investigative journalism",
		"victim advocacy", "sentencing reform", "legal defense", "criminal record", "constitutional rights", "police reform", "court hearing", "criminal investigation", "forensic science", "evidence",
		"jury", "bail", "appeals", "law and order", "organized crime", "white-collar crime", "criminal sentencing", "crime prevention", "police department", "legal proceedings", "crime statistics",
		"criminal behavior", "judicial system", "legal reform", "prison reform", "security measures", "criminal trial", "public safety", "law enforcement strategy", "legal investigation", "court verdict"
	  ],
	  "World News": [
		"international", "global", "breaking news", "news update", "world affairs", "global politics", "international relations", "UN", "peace talks", "conflict",
		"foreign policy", "diplomacy", "war", "humanitarian", "trade deals", "embassy", "refugees", "international organizations", "global economy", "world events",
		"human rights violations", "UN resolutions", "global summit", "peacekeeping", "foreign aid", "global security", "international law", "border disputes", "multilateralism", "cross-border",
		"international trade", "geopolitical tensions", "global cooperation", "diplomacy efforts", "international crisis", "global media", "global health", "international sanctions", "strategic alliances", "global governance",
		"international community", "world leaders", "global partnerships", "global challenges", "cross-cultural", "international development", "global impact", "world diplomacy", "international negotiations", "foreign relations"
	  ],
	  "Environment": [
		"climate change", "pollution", "renewable energy", "sustainability", "ecosystem", "greenhouse gases", "carbon footprint", "environmental policy", "conservation", "recycling",
		"global warming", "deforestation", "wildlife", "carbon emissions", "water conservation", "plastic waste", "climate action", "environmental protection", "green technology", "natural resources",
		"environmental activism", "air quality", "sustainable development", "carbon trading", "environmental justice", "eco-friendly initiatives", "habitat destruction", "energy efficiency", "waste management", "climate resilience",
		"environmental impact", "clean energy", "biodiversity", "environmental research", "green building", "pollution control", "eco innovation", "water quality", "renewable resources", "emission reduction",
		"sustainable practices", "climate policy", "ecological balance", "environmental awareness", "green initiatives", "renewable power", "conservation efforts", "environmental science", "natural conservation", "climate mitigation"
	  ],
	  "Entertainment": [
		"movies", "music", "celebrity", "TV shows", "comedy", "film industry", "theater", "streaming", "video games", "concerts",
		"pop culture", "celebrity news", "pop music", "award shows", "fashion", "art", "radio", "books", "performances", "reality TV",
		"film festival", "box office", "entertainment news", "stand-up comedy", "live performance", "music festival", "streaming service", "drama", "director", "screenplay",
		"soundtrack", "pop icon", "music video", "talent show", "cultural event", "celebrity gossip", "movie premiere", "blockbuster", "indie film", "animation",
		"television series", "web series", "award ceremony", "behind the scenes", "entertainment industry", "celebrity interview", "pop art", "theater production", "film review", "media coverage"
	  ],
	  "Sports": [
		"football", "basketball", "baseball", "soccer", "Olympics", "athlete", "tournament", "sports news", "championship", "fitness",
		"rugby", "swimming", "tennis", "golf", "team", "competition", "sportsmanship", "track and field", "stadium", "training",
		"league", "sports event", "sports betting", "athletic performance", "endurance", "sports analytics", "sports injury", "coaching", "fan engagement", "world cup",
		"sporting event", "game day", "athlete endorsement", "sports strategy", "match analysis", "sports update", "pro athlete", "sports management", "fitness regime", "athletic training",
		"sporting goods", "championship game", "sports conference", "game statistics", "sports network", "performance metrics", "sports tournament", "competitive sports", "professional league", "sports culture"
	  ],
	  "Lifestyle": [
		"travel", "food", "fashion", "wellness", "home decor", "personal development", "relationships", "fitness", "hobbies", "self-care",
		"mindfulness", "beauty", "gardening", "cooking", "vacation", "health", "parenting", "luxury", "volunteering", "leisure activities",
		"travel tips", "lifestyle trends", "cultural experiences", "work-life balance", "interior design", "travel guide", "fitness routines", "organic lifestyle", "sustainable living", "lifestyle blog",
		"travel destination", "fashion trends", "self-improvement", "home improvement", "beauty tips", "culinary arts", "travel photography", "outdoor adventure", "lifestyle inspiration", "healthy recipes",
		"personal finance", "eco-friendly living", "minimalist lifestyle", "wellness retreat", "fashion accessories", "creative hobbies", "modern living", "lifestyle magazine", "seasonal trends", "cultural lifestyle"
	  ],
	  "Weather": [
		"forecast", "temperature", "storm", "rain", "snow", "hurricane", "wind", "flood", "climate", "meteorology",
		"global warming", "drought", "temperature rise", "weather patterns", "precipitation", "thunderstorm", "weather alert", "temperature drop", "high pressure", "weather map",
		"lightning", "weather system", "weather conditions", "humidity", "atmospheric pressure", "weather station", "weather radar", "cold front", "warm front", "snowfall",
		"severe weather", "weather update", "meteorological data", "climate change", "weather forecast model", "weather phenomenon", "storm surge", "weather monitoring", "wind chill", "weather warning",
		"weather report", "climate variability", "microclimate", "weather simulation", "climate model", "weather analysis", "weather prediction", "seasonal weather", "atmospheric conditions", "weather advisory"
	  ],
	  "Education": [
		"school", "university", "degree", "learning", "curriculum", "classroom", "online education", "teacher", "student", "academic",
		"tuition", "scholarship", "research", "test preparation", "knowledge", "exam", "study", "teaching method", "academic success", "education policy",
		"higher education", "distance learning", "educational technology", "e-learning", "vocational training", "college", "campus", "academic conference", "academic research", "student life",
		"academic achievement", "curriculum development", "standardized testing", "lifelong learning", "educational reform", "academic institution", "classroom technology", "study abroad", "academic program", "online course",
		"peer learning", "educational resources", "student assessment", "academic scholarship", "blended learning", "education system", "school district", "academic calendar", "learning management", "educational standards"
	  ],
	  "Innovation": [
		"creativity", "invention", "disruption", "technology", "startups", "patent", "design", "R&D", "product development", "prototype",
		"ideas", "future", "problem solving", "entrepreneurship", "breakthrough", "science", "market trends", "digital transformation", "smart cities", "future tech",
		"innovative solutions", "creative process", "innovation hub", "cutting edge", "research and development", "disruptive innovation", "creative thinking", "tech innovation", "innovation strategy", "innovation ecosystem",
		"emerging technology", "creative innovation", "innovative design", "innovation lab", "future innovation", "startup culture", "product innovation", "innovative ideas", "innovation awards", "entrepreneurial spirit",
		"tech startups", "digital innovation", "creative industry", "innovation trends", "market disruption", "innovation management", "innovative startup", "breakthrough technology", "idea generation", "design thinking"
	  ],
	  "Social Responsibility": [
		"charity", "volunteering", "activism", "environmental sustainability", "corporate social responsibility", "philanthropy", "equality", "diversity", "community service", "giving back",
		"nonprofits", "human rights", "social justice", "fundraising", "ethical business", "climate action", "fair trade", "health equity", "conscious consumerism", "social impact",
		"sustainable development", "community engagement", "corporate ethics", "social innovation", "volunteer work", "civic engagement", "social change", "responsible investment", "impact investing", "community development",
		"corporate citizenship", "social advocacy", "environmental justice", "ethical consumerism", "responsible business", "community outreach", "social welfare", "public service", "charitable giving", "ethical leadership",
		"social entrepreneurship", "equitable development", "sustainability initiatives", "green business", "social reform", "community empowerment", "volunteerism", "corporate philanthropy", "social equity", "social progress"
	  ],
	  "Manufacturing": [
		"production", "assembly line", "factory", "industry", "manufacturing process", "quality control", "supply chain", "automation", "robotics", "materials",
		"machinery", "logistics", "custom production", "mass production", "lean manufacturing", "industrial engineering", "product assembly", "manufacturing plant", "production efficiency", "factory floor",
		"industrial design", "process optimization", "manufacturing technology", "quality assurance", "plant operations", "production management", "manufacturing cost", "industrial production", "production scheduling", "inventory control",
		"manufacturing innovation", "assembly process", "supply chain management", "industrial automation", "production line efficiency", "manufacturing standards", "factory automation", "industrial robotics", "operational efficiency", "production capacity",
		"manufacturing equipment", "process engineering", "industrial production rate", "manufacturing quality", "production optimization", "production planning", "industrial process", "manufacturing plant safety", "production throughput", "lean production"
	  ],
	  "Culture": [
		"tradition", "art", "heritage", "customs", "history", "values", "society", "ethnicity", "language", "rituals",
		"celebrations", "arts", "music", "philosophy", "religion", "cultural identity", "cultural diversity", "literature", "dance", "museum",
		"folklore", "cultural heritage", "cultural events", "cultural traditions", "heritage sites", "cultural preservation", "indigenous culture", "cultural expression", "art exhibitions", "cultural exchange",
		"societal norms", "cultural narratives", "historical legacy", "artistic movements", "cultural icons", "cultural evolution", "cultural festivals", "contemporary art", "cultural studies", "traditional crafts",
		"cultural dialogue", "cultural influence", "art history", "cultural symbolism", "diversity initiatives", "multiculturalism", "artistic expression", "cultural institutions", "cultural critique", "heritage conservation"
	  ]
  }


  return articles.map(article => {
    const matchedCategories = Object.entries(categories).reduce((acc, [category, keywords]) => {
      const content = `${article.title} ${article.description}`.toLowerCase();
      if (keywords.some(keyword => content.includes(keyword))) {
        acc.push(category);
      }
      return acc;
    }, []);

    return {
      ...article,
      categories: matchedCategories.length > 0 ? matchedCategories : ["Uncategorized"]
    };
  });
};

// Filter articles based on selected category
const filterArticlesByCategory = (articles, selectedCategory) => {
  if (selectedCategory === "All" || !selectedCategory) {
    return articles; // Show all articles if no category is selected or 'All' is selected
  }
  return articles.filter(article => article.categories.includes(selectedCategory));
};

  return (
  <div className="home-container">
    

  <div className="search-button">
	<SearchForm
	  searchTerm={searchTerm}
	  startDate={startDate}
	  endDate={endDate}
	  category={category}
	  showNewsletter={showNewsletter}
	  showForum={showForum}
	  showBlog={showBlog}
	  handleSearchChange={handleSearchChange}
	  setStartDate={setStartDate}
	  setEndDate={setEndDate}
	  handleCategoryChange={handleCategoryChange}
	  toggleNewsletter={toggleNewsletter}
	  toggleForum={toggleForum}
	  toggleBlog={toggleBlog}
    handleSearchSubmit={handleSearchSubmit}
	  />
  </div>

    <div className="bottom-bar-container">
	  <button className="Clear-Button" onClick={() => setNews([])}>
		Clear
	  </button>
	  <div className="results-per-page-container">
		<label htmlFor="resultsPerPage">Results per page:</label>
		<select
		  id="resultsPerPage"
		  value={resultsPerPage}
		  onChange={handleResultsPerPageChange}
		>
		  <option value={10}>10</option>
		  <option value={25}>25</option>
		  <option value={50}>50</option>
		  <option value={100}>100</option>
		</select>
	  </div>
	</div>

    <div className="colored-bar-bottom"></div>

    {loading ? (
      <p>Loading...</p>
    ) : (
      <NewsResults
        news={news}
        currentPage={currentPage}
        resultsPerPage={resultsPerPage}
        totalArticles={totalArticles}
        getPaginationButtons={getPaginationButtons}
		selectedCategory={category}
      />
    )}
  </div>
);

}

export default Home;