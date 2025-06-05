import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import pytz
from datetime import datetime
from dateutil import parser

@csrf_exempt  # Disable CSRF for development (remove in production or use proper CSRF handling)
def fetch_serp_api(request):
    API_KEY = "4a00dc7f8afb3d342c60a253a95845978b6ce823680eb5df86bac5a7f79354da"
    BASE_URL = "https://serpapi.com/search"

    # Get search query and dates from frontend request
    query = request.GET.get("q") 
    start_date = request.GET.get("startDate", "")  # Expecting MM/DD/YYYY format
    end_date = request.GET.get("endDate", "") 

   # Convert dates to datetime objects
    try:
        start_dt = datetime.strptime(start_date, "%Y-%m-%d").replace(tzinfo=pytz.UTC)
        end_dt = datetime.strptime(end_date, "%Y-%m-%d").replace(tzinfo=pytz.UTC)
    except ValueError:
        return JsonResponse({"error": "Invalid date format. Use YYYY-MM-DD"}, status=400)


    # Construct 'tbs' parameter for date filtering
    tbs_param = f"cdr:1,cd_min:{start_date},cd_max:{end_date}"

    params = {
        "q": query,
        "tbs": tbs_param,
        "tbm": "nws",
        "engine": "google_news",
        "api_key": API_KEY,
        "sort_by": "date",
    }

    try:
        response = requests.get(BASE_URL, params=params)
        data = response.json()
        # print("SerpAPI Response:", data)  # Debugging
        news_results = data.get("news_results", [])

         # **Manual filtering for strict date enforcement**
        filtered_results = []
        for article in news_results:
            article_date_str = article.get("date", "").replace(" UTC", "")

            if article_date_str:
                try:
                    article_datetime = datetime.strptime(article_date_str, "%m/%d/%Y, %I:%M %p, %z").astimezone(pytz.UTC)
                    if start_dt <= article_datetime <= end_dt:
                        filtered_results.append(article)
                except ValueError:
                    print(f"Skipping invalid date format: {article_date_str}")

        return JsonResponse({"news_results": filtered_results})  # Return articles to frontend
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
