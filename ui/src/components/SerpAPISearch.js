//serpAPISearch.js
// Might not need this code anymore as it was used to render articles but since newsResults.js
// also renders the articles it is reduntant
import React, { useState } from "react";
import { fetchSerpAPI } from "./serpAPI"; 
import handleSearchSubmit from "../pages/home"; // Import handleSearchSubmit

const SerpAPISearch = () => {
  const [query, setQuery] = useState("");
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(""); 

    try {
      // Call handleSearchSubmit instead of directly fetching from SerpAPI
      await handleSearchSubmit(query, "", "", ""); // Adjust parameters as needed
    } catch (error) {
      setError("An error occurred while fetching articles. Please try again.");
    }

    setLoading(false);
  };
};

export default SerpAPISearch;
