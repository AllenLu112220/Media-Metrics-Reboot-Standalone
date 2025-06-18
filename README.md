# Media-Metrics-Reboot
Respository for the 10 year reboot of the Media Metrics Grabber for the DASH-hound application.

DASH Hound collects news coverage based on a user defined keyword set and a time frame. This project's output feeds into a larger media analysis system that combines the news coverage with other media analyitcs. It also utilizes OpenAI API for custom categorization of articles via header and summary. 

## Table of Contents
- [Instructions](#instructions)
- [How to Use](#how-to-use)
- [Features](#features)
- [AI-Powered Categorization](#ai-powered-categorization)
- [API Documentation](#api-documentation)
- [Future Considerations](#future-considerations)

---
## Instructions
To run AWS LightSail instance
1. make sure the directory is media-metrics-projects/Media-Metrics-Reboot/DjangoMediaMetrics 
2. run ```pm2 start python --name "django-app" -- manage.py runserver 0.0.0.0:8000 ```
3. change directory to media-metrics-projects/Media-Metrics-Reboot/ui
4. run ```pm2 start npm --name "react-app" -- start -- --host 0.0.0.0 --port 3000```
5. Both front and backend components should be operational.


## How to use
To properly use our application, you must create an account and sign in.
* In the search form popup, you can build a search query by entering keywords, specifying the search using boolean operators, and choosing a date range. 
* (Currently the date range can only search articles published within a month of the current date.)

## Features
### Login
The login feature enables users to securely access the DASH Hound application. Logging in is required to unlock the application's core functionalities, such as searching and search history. Users can log in using their registered email address and password.

Additionally, a password reset option is available; however, this feature is currently under development and not fully functional at this time.

### News Aggregator
The News Aggregator is the primary feature of the DASH Hound application. It allows users to create customized search queries to aggregate relevant articles. Users can:
* Specify Search Query: Filter articles by using boolean operators to get specific articles.
    - AND: Find articles containing both keywords.
    - NOT: Excludes articles containing a specific keyword.
    - OR: Find articles containing either keyword.
    - (Parentheses): Groups keywords and operators.
    - "Quotes": Searches for an exact phrase.
* Date Range Filtering: Define a start and end date to narrow down search results to a specific timeframe.
* Category Selection: Choose a category (e.g., Technology, Politics, Health) to receive more focused and relevant articles.     

This powerful search tool helps users stay up-to-date with articles that matter most to them.

### Search History
This feature lets users view their previous 10 search queries, including keywords with boolean operators, start date, and end date. This feature also allows users to reuse the search and find relevant articles again. 

### Search Database (Admin Only)
This component allows administrator-level users to search through all aggregated news in the database through the use of keywords or publication names. Additionally, the user must specify their start and end date.

## API Documentation
DASH-Hound uses the following APIs to gather aggregated articles.  
 **MediaStack API**
- Our project currently integrates with the MediaStack API, which provides aggregated news data. 
- Free plan: allows access to news from the past three months and offers 100 API calls per month.

## AI-Powered Categorization

We use **ChatGPT-4.0 API** to dynamically generate **custom categories** for articles based on their:

- Title  
- Summary  
- Keywords  

This extends our static taxonomy and helps surface niche or emerging topics.

### Example Prompt ChatGPT-4:

```json
{
  "model": "gpt-4",
  "messages": [
    {
      "role": "system",
      "content": "You are a news analyst. Categorize articles into modern topics like 'AI Regulation', 'Climate Startups', 'Data Privacy', etc."
    },
    {
      "role": "user",
      "content": "Title: 'Congress Debates New AI Regulation Bill'\nSummary: 'A new bipartisan bill seeks to limit the scope of AI in surveillance...'\nKeywords: ['AI', 'Congress', 'Legislation']"
    }
  ]
}
```

Result:
```json
{
  "category": "AI Regulation"
}
```

These dynamic categories are stored in the backend alongside the article and displayed in the UI.


**SerpAPI** 
- SerpAPI is a web scrapping API that allows you to scrape the results from Google search. DASH-Hound uses the Google News scrapper provided by SerpAPI.
- Developer (Paid) plan: 5,000 requests per month. This is subject to change depending on the client's preferences. 

**CurrentsAPI**
- Currents News API provides a comprehensive solution for curating global news and delivering it in a parsable format.
- Free plan: 600 total requests per month but limited to 20 requests per day. 

**NewsAPI**
- Find news articles that match one or more search conditions. 
- Free plan: 100 requests per day.
     
## Future Considerations
- Expand to include more information-sharing mediums such as blogs and forums. ​
 
