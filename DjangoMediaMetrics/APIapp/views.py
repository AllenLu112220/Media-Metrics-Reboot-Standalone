import logging
from django.shortcuts import render
from newsapi import NewsApiClient
from django.http import JsonResponse, QueryDict
from django.http import HttpResponseBadRequest
from dateutil import parser
import urllib.parse
import re
import requests

API_KEY = 'oRAoCbzOC3TsK1GarUvz61PrP0VK8sUvFfFBzFeJjjxKz-UW'
API_URL = 'https://api.currentsapi.services/v1/search'

# Get an instance of a logger
logger = logging.getLogger(__name__)

def format_query(query):
    # Replace logical operators with their respective symbols
    # Replace logical operators with their respective symbols
    query = re.sub(r'\bNOT\b', '-', query)  # Replace 'NOT' with '-'
    query = re.sub(r'\bAND\b', ' ', query)  # Replace 'AND' with ' '
    query = re.sub(r'\bOR\b', ',', query)   # Replace 'OR' with ','

    # Handle spaces around parentheses
    query = re.sub(r'\s*\(\s*', '(', query)  # Remove spaces before and after '('
    query = re.sub(r'\s*\)\s*', ')', query)  # Remove spaces before and after ')'

    # Replace multiple consecutive spaces with ' AND '
    query = re.sub(r'\s{2,}', ' AND ', query)

    # Split the query into words
    words = query.split()

    # Rebuild the query ensuring logical operators are handled correctly
    formatted_query = ""
    prev_word = None

    for i, word in enumerate(words):
        next_word = words[i + 1] if i + 1 < len(words) else None

        if word == ',':
            formatted_query += ' OR'
        elif word == '-':
            formatted_query += ' NOT'
        elif word == ' ':
            if prev_word and prev_word not in ('OR', 'AND', 'NOT', '-') and next_word and next_word not in ('OR', 'AND', 'NOT', '-') and not prev_word.endswith(')') and not next_word.startswith('('):
                formatted_query += ' AND'
        else:
            formatted_query += ' ' + word

        prev_word = word

    # Add the last phrase if it exists
    formatted_query = re.sub(r'(\w+)\s*\(', r'\1 AND (', formatted_query)
    formatted_query = re.sub(r'\)\s*(\w+)', r') AND \1', formatted_query)
    formatted_query = re.sub(r' AND NOT ', ' NOT ', formatted_query)  # Ensure "AND NOT" becomes "NOT"
    formatted_query = re.sub(r'\s*NOT\s*\(', r' NOT (', formatted_query)  # Handle "NOT" correctly with parentheses
    formatted_query = re.sub(r'NOT\s*AND\s*', ' NOT ', formatted_query)  # Remove 'AND' if it's after 'NOT'
    formatted_query = re.sub(r'(\S)\s*-\s*(\S)', r'\1 NOT \2', formatted_query)  # Fix for NOT formatting

    return formatted_query.strip()

    

# Due to how NewsAPI returns the date published, the date must be normalized 
# "Zulu" format to "UTC" format in order to be saved into the database.
def normalize_datetime(date_str):
    try:
        return parser.parse(date_str).isoformat()
    except Exception as e:
        logger.debug("Failed to parse date: %s", date_str)
        return None

def get_news(request):
    try:
        logger.debug("Received request: %s", request.GET)  # Log the incoming query parameters
        newsapi = NewsApiClient(api_key='5d85e8266c954d128e2f9c8060f22114')
        
        # Get query parameters
        query = request.GET.get('q', '')
        start_date = request.GET.get('startDate', '')
        end_date = request.GET.get('endDate', '')

        # Handle missing query parameters
        if not query or not start_date or not end_date:
            logger.debug("Missing parameters")
            return HttpResponseBadRequest("Missing required parameters")
        
        formatted_query = format_query(query)
        logger.debug("Formatted query: %s", formatted_query)
        
        # Fetch news articles
        all_articles = newsapi.get_everything(
            q=formatted_query,
            from_param=start_date,
            to=end_date,
            language='en',
            sort_by='publishedAt',
            page=1
        )

        article_count = len(all_articles.get('articles', []))
        logger.debug("Fetched %d articles", article_count)

        for article in all_articles.get('articles', []):
            if 'publishedAt' in article:
                article['publishedAt'] = normalize_datetime(article['publishedAt'])

        return JsonResponse({
            'all_articles': all_articles['articles'],
        })
    except Exception as e:
        logger.debug("Error occurred: %s", str(e))  # Log any error
        return JsonResponse({
            'error': str(e),
        }, status=500)
    
def fetch_CurrentsAPI_news(request):
    query = request.GET.get('q', '')  
    start_date = request.GET.get('startDate', '')  
    end_date = request.GET.get('endDate', '')  

    language = 'en'  
    country = 'US'  

    formatted_query = format_query(query)
    logger.debug("Formatted keywords: %s", formatted_query)

    params = {
        'apiKey': API_KEY,
        'keywords': formatted_query,  
        'language': language,  
        'country': country, 
        'start_date': start_date,
        'end_date': end_date,
        'page_size': 100,
    }

    try:
        response = requests.get(API_URL, params=params)
        response.raise_for_status()  

        data = response.json()
        if data.get('status') == 'ok':
            num_articles = len(data['news'])
            logger.debug(f"Number of articles pulled from Currents: {num_articles}")  # Logging the number of articles


            formatted_articles = [
                {
                    'author': article.get('author') or article.get('source', {}).get('name', None),
                    'category': article.get('category', ''),
                    'country': article.get('country', 'us'),
                    'description': article.get('description', ''),
                    'image': article.get('urlToImage', None),
                    'language': 'en',  
                    'published_at': article.get('publishedAt', ''),
                    'source': article.get('source', {}).get('name', article.get('source', {}).get('id', '')),
                    'title': article.get('title', ''),
                    'url': article.get('url', '')
                }
                for article in data['news']
            ]

            return JsonResponse({'total_articles': num_articles, 'articles': formatted_articles})
        else:
            logger.debug("No results found or API error.")
            return JsonResponse({'error': 'No results found or API error.'}, status=400)
    
    except requests.RequestException as e:
        logger.debug(f"Error fetching news: {e}")
        return JsonResponse({'error': 'Failed to fetch news. Try again later.'}, status=500)


