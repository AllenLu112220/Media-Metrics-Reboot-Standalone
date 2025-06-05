import csv
import os
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import FileSystemStorage
from django.db import connection
from django.utils.dateparse import parse_date
from datetime import datetime

def parse_csv_date(date_str):
    """Parse date from MM/DD/YYYY format to YYYY-MM-DD."""
    if not date_str:
        return None
    try:
        return datetime.strptime(date_str, "%m/%d/%Y").date()
    except ValueError:
        return None  # Handle invalid dates gracefully

@csrf_exempt
def upload_csv(request):
    if request.method == 'POST' and request.FILES.get('file'):
        file = request.FILES['file']
        fs = FileSystemStorage()
        filename = fs.save(file.name, file)
        filepath = fs.path(filename)

        try:
            encodings_to_try = ['utf-8', 'latin1', 'windows-1252']
            for enc in encodings_to_try:
                try:
                    with open(filepath, newline='', encoding=enc) as csvfile:
                        reader = csv.reader(csvfile)
                        headers = next(reader)

                        # Normalize headers (strip spaces, remove BOM if present)
                        headers[0] = headers[0].lstrip("\ufeff")
                        headers = [h.strip().strip('"') for h in headers]
                        while headers and headers[-1] == '':
                            headers.pop()

                        expected_headers = ["Date", "Headline", "Article Text", "Publisher", "URL"]
                        if headers != expected_headers:
                            return JsonResponse({'message': f'Invalid CSV format. Expected: {expected_headers}, Got: {headers}'}, status=400)

                        rows = []
                        for row in reader:
                            row = [None if cell == '' else cell for cell in row]
                            row[0] = parse_csv_date(row[0])  # Convert date
                            while len(row) < 9:
                                row.append(None)
                            rows.append(tuple(row))
                    break  # If we get here, decoding was successful
                except UnicodeDecodeError:
                    continue
            else:
                return JsonResponse({'message': 'File encoding not supported. Please use UTF-8, Latin-1, or Windows-1252.'}, status=400)

            # Insert rows into DB
            with connection.cursor() as cursor:
                insert_query = """
                INSERT INTO Article (ArticleType, Author, DateOfBroadcast, Headline, Image, ParsedDomain, PublicationName, Subline, URL)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """
                cursor.executemany(insert_query, rows)

            return JsonResponse({'message': 'Data inserted successfully.'} ,status=200)

        except Exception as e:
            return JsonResponse({'message': f'Error: {str(e)}'}, status=500)

        finally:
            if os.path.exists(filepath):
                os.remove(filepath)

    return JsonResponse({'message': 'No file uploaded.'}, status=400)
