import requests

# API credentials
api_key = 'yujFLfzZuqpi8AenB-_aW_nMCNUx9r3XOq8t6YT_RlGb_u_d'

# API endpoint
url = 'https://api.currentsapi.services/v1/search'

# SQL-like query
query = "Elon AND (Space OR Tesla)"

# Request parameters
params = {
    'apiKey': api_key,
    'keywords': query,      # Complex query
    'language': 'en',
    'country': 'US',
    'page_size': 100,       # Fetch up to 100 results
    'start_date': '2025-02-14T00:00:00Z',
    'end_date': '2025-02-25T23:59:59Z',
}

# Make the API request
response = requests.get(url, params=params)

# Check the response
if response.status_code == 200:
    data = response.json()
    if data['status'] == 'ok':
        total_articles = len(data['news'])
        print(f"Total articles found: {total_articles}")
        for article in data['news']:
            print(article['title'])  # Print each article's title
    else:
        print("No results found or error in response.")
else:
    print(f"Error: {response.status_code}")
