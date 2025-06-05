# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License.

# -*- coding: utf-8 -*-

import json
import os
from pprint import pprint
import requests

'''
This sample makes a call to the Bing Web Search API with a query and returns relevant web search.
Documentation: https://docs.microsoft.com/en-us/bing/search-apis/bing-web-search/overview
'''


# Add your Bing Search V7 subscription key and endpoint to your environment variables.
subscription_key = '8c8db80da360488a960d15edc69a5f1b'
endpoint = 'https://api.bing.microsoft.com/v7.0/search'


# Query term(s) to search for.
query = "Microsoft after:2010-11-10 before:2012-11-10"

# Construct a request
mkt = 'en-US'
params = {'q': query, 'mkt': mkt}
headers = {'Ocp-Apim-Subscription-Key': subscription_key}

# Call the API
try:
    response = requests.get(endpoint, headers=headers, params=params)
    response.raise_for_status()

    print("Headers:")
    pprint(response.headers)

    print("JSON Response:")
    pprint(response.json())
except requests.exceptions.RequestException as e:
    print(f"An error occurred: {e}")