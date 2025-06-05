from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from .models import SearchQueries, Article
from django.utils import timezone
from django.middleware.csrf import get_token
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_protect, csrf_exempt
from django.db import connection, transaction
from django.core.files.storage import FileSystemStorage
from rest_framework.decorators import api_view  
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q
from datetime import datetime
import logging
import json
import csv
import re


# Create your views here.
logger = logging.getLogger(__name__)


#Takes the users search query and stores into the database after submission.
@csrf_protect
@login_required
@require_POST
@api_view(['POST'])
def save_search_query(request):
    try:
        user = request.user
        keyword = request.data.get('keyword')
        date_queried = timezone.now().date()
        start_date = request.data.get('start_date')
        end_date = request.data.get('end_date')
        category = request.data.get('category')
        article_type = request.data.get('article_type')
        query = SearchQueries(
            keyword=keyword,
            date_queried=date_queried,
            start_date=start_date,
            end_date=end_date,
            category=category,
            article_type=article_type,
            user_id=user
        )
        query.save()

        return JsonResponse({'status': 'success', 'message': 'Search query saved.', 'query_id': query.query_id}, status=201)
    
    except json.JSONDecodeError:
        return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    
#Retrieve csrf token to communicate with the database
@ensure_csrf_cookie
def csrf_token_view(request):
    csrf_token = get_token(request)
    return JsonResponse({'csrfToken': csrf_token})


@csrf_exempt
def save_articles(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        try:
            query_id = data.get('query_id')
            if not query_id:
                return JsonResponse({'error': 'query_id is required'}, status=400)

            try:
                search_query = SearchQueries.objects.get(query_id=query_id)
            except SearchQueries.DoesNotExist:
                return JsonResponse({'error': f'SearchQueries with query_id {query_id} not found'}, status=400)

            articles = data.get('articles', [])
            article_type = data.get('article_type')

            if not articles:
                return JsonResponse({'error': 'articles are required'}, status=400)

            # Pre-fetch existing articles' URLs in bulk to reduce repetitive queries
            existing_urls = set(Article.objects.filter(
                url__in=[article['url'] for article in articles]
            ).values_list('url', flat=True))

            duplicate_count = 0
            new_articles = []

            for article in articles:
                url = article.get('url')
                if not url:
                    continue

                # Skip duplicates by checking against pre-fetched URLs
                if url in existing_urls:
                    duplicate_count += 1
                    existing_article = Article.objects.filter(url=url).first()
                    existing_article.queries.add(search_query)
                    continue

                # Parse published_at into a date object
                published_at = article.get('published_at')
                date_broadcast = None
                if published_at:
                    try:
                        date_broadcast = datetime.fromisoformat(published_at.rstrip('Z')).date()
                    except ValueError:
                        return JsonResponse({'error': f'Invalid date format for published_at: {published_at}'}, status=400)
                    
                category = article['categories'][0]


                # Prepare articles for batch creation
                new_articles.append(Article(
                    date_of_broadcast=date_broadcast,
                    headline=article.get('title'),
                    subline=article.get('description'),
                    url=url,
                    parsed_domain=article.get('source', 'Unknown Source'),
                    image=article.get('image'),
                    author=article.get('author'),
                    article_type=article_type,
                    publication_name=article.get('source', 'Unknown Source'),
                    category = category
                ))

            # Bulk create new articles for efficiency
            created_articles = Article.objects.bulk_create(new_articles)

            # Refresh the created articles to ensure they have IDs
            created_articles = Article.objects.filter(
                url__in=[article.url for article in new_articles]
            )

            # Add search_query relationship in bulk for created articles
            for article in created_articles:
                article.queries.add(search_query)

            logger.debug(f"{duplicate_count} duplicate articles were found.") if duplicate_count > 0 else logger.debug("No duplicates found.")

            return JsonResponse({'message': 'Articles saved successfully'}, status=200)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Method Not Allowed'}, status=405)


def search_news(request):
    if request.method == 'POST':
        try:
            # Get data from request
            data = json.loads(request.body)
            keyword = data.get('keyword', '').strip('"') 
            publication = data.get('publication', '')
            start_date = data.get('startDate', '')
            end_date = data.get('endDate', '')

            # Manually build the SQL query to search for articles
            query = "SELECT * FROM Article WHERE 1=1"
            params = []
            logger.debug(f"Request received with parameters - keyword: {keyword}, publication: {publication}, start_date: {start_date}, end_date: {end_date}")
            # Add conditions based on the filters
            if keyword:
                query += " AND (Headline LIKE %s OR Subline LIKE %s)"
                params.extend([f"%{keyword}%", f"%{keyword}%"])
            
            if publication:
                query += " AND PublicationName LIKE %s"
                params.append(f"%{publication}%")
            
            if start_date:
                query += " AND DateOfBroadcast >= %s"
                params.append(start_date)
            
            if end_date:
                query += " AND DateOfBroadcast <= %s"
                params.append(end_date)

            logger.debug(f"Constructed SQL query: {query}")
            logger.debug(f"Executing SQL query: {query} with parameters {params}")

            # Execute raw SQL query
            with connection.cursor() as cursor:
                cursor.execute(query, params)
                rows = cursor.fetchall()

            logger.debug(f"Number of articles fetched: {len(rows)}")

            # Prepare the response data from the query result
            results = []
            for row in rows:
                results.append({
                    'headline': row[1],  # Adjust based on the order of fields
                    'subline': row[2],
                    'url': row[3],
                    'parsed_domain': row[4],
                    'image': row[5],
                    'author': row[6],
                    'article_type': row[7],
                    'publication_name': row[8],
                    'date_of_broadcast': row[0],  # Make sure the index corresponds to the field
                })

            logger.debug(f"Returning {len(results)} articles as the response")
            return JsonResponse({'results': results}, status=200)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)


#upload articles from CSV file to database
@csrf_exempt
def upload_csv(request):
    if request.method == 'POST' and request.FILES.get('file'):
        file = request.FILES['file']
        fs = FileSystemStorage()
        filename = fs.save(file.name, file)
        filepath = fs.path(filename)

        try:
            with open(filepath, newline='', encoding='utf-8') as csvfile:
                reader = csv.reader(csvfile)
                headers = next(reader)
                rows = [tuple(row) for row in reader]

            with connection.cursor() as cursor:
                #Adjust table and colums based on database schema
                insert_query="""
                INSERT INTO Article (ArticleType, Author, DateOfBroadcast, Headline, Image, ParsedDomain, PublicationName, QueryID, Subline, URL)
                VALUES(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """
                cursor.executemany(insert_query, rows)
            
            return JsonResponse({'message': 'Data inserted successfully.'}, status=200)
        except Exception as e:
            return JsonResponse({'message': str(e)}, status=500)
    else:
        return JsonResponse({'message': 'No File uploaded.'}, status=400)

#Since our program integrates multiple APIs, each with its own rules for handling AND, OR, and NOT searches,
# this function standardizes all queries to match the format used when the user creates a search in the search box.
def format_query(query):
    query = re.sub(r'\bNOT\b', '-', query) 
    query = re.sub(r'\bAND\b', ' ', query) 
    query = re.sub(r'\bOR\b', ',', query)  
    query = re.sub(r'\s*\(\s*', '(', query)  
    query = re.sub(r'\s*\)\s*', ')', query)  
    query = re.sub(r'\s{2,}', ' AND ', query)

    words = query.split()

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

    formatted_query = re.sub(r'(\w+)\s*\(', r'\1 AND (', formatted_query)
    formatted_query = re.sub(r'\)\s*(\w+)', r') AND \1', formatted_query)
    formatted_query = re.sub(r' AND NOT ', ' NOT ', formatted_query) 
    formatted_query = re.sub(r'\s*NOT\s*\(', r' NOT (', formatted_query) 
    formatted_query = re.sub(r'NOT\s*AND\s*', ' NOT ', formatted_query) 
    formatted_query = re.sub(r'(\S)\s*-\s*(\S)', r'\1 NOT \2', formatted_query) 

    return formatted_query.strip()

#This function is used to retrieve the past 10 searches made by a user.
@login_required
def get_search_history(request):
    print(f"Authenticated user: {request.user.is_authenticated}")
    user = request.user
    searches = SearchQueries.objects.filter(user_id=request.user).order_by('-date_queried', '-query_id')[:10]
    search_data = [
        {
            'keyword': format_query(search['keyword']),  # Format the keyword
            'start_date': search['start_date'],
            'end_date': search['end_date'],
            'query_id': search['query_id'],
        }
        for search in searches.values('keyword', 'start_date', 'end_date', 'query_id')
    ]
    return JsonResponse(search_data, safe=False)