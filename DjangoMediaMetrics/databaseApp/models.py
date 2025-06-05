from django.db import models
from authapp.models import CustomUser

#Database for each user search query
class SearchQueries(models.Model):
    query_id = models.AutoField(primary_key=True, db_column='QueryID')
    keyword = models.CharField(max_length=200)
    date_queried = models.DateField()
    start_date = models.DateField()
    end_date = models.DateField()
    category = models.CharField(max_length=100)
    article_type = models.CharField(max_length=100)
    user_id= models.ForeignKey(CustomUser, on_delete=models.CASCADE, db_column='UserID')
    

    class Meta:
        db_table = 'SearchQueries'  # Use existing table
        managed = False

#Database for the aggregated articles
class Article(models.Model):
    id = models.AutoField(primary_key=True, db_column='ID')
    date_of_broadcast = models.DateField(db_column='DateOfBroadcast')
    headline = models.CharField(max_length=500, db_column='Headline')
    subline = models.CharField(max_length=1000, db_column='Subline')
    url = models.CharField(max_length=1000, db_column='URL')
    parsed_domain = models.CharField(max_length=255, db_column='ParsedDomain')
    image = models.CharField(max_length=1000, db_column='Image', null=True, blank=True)  # optional field
    author = models.CharField(max_length=255, db_column='Author',null=True, blank=True)  # optional field
    article_type = models.CharField(max_length=100, db_column='ArticleType')
    publication_name = models.CharField(max_length=255, db_column='PublicationName')

    category = models.CharField(max_length=100, db_column='category', null=True, blank=True)  # added category field
    queries = models.ManyToManyField(SearchQueries,related_name='articles', blank=True)

    class Meta:
        db_table = 'Article' # Use existing table
        managed = False