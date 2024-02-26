# Copyright 2018 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# [START gae_python38_app]
# [START gae_python3_app]
from flask import Flask, request, jsonify, flash
from ebay_oauth_token import OAuthToken
import requests

# If `entrypoint` is not defined in app.yaml, App Engine will look for an app
# called `app` in `main.py`.
app = Flask(__name__)

@app.route("/")
def serve_static():
    return app.send_static_file("index.html")

@app.route("/finditems", methods=["GET"])
def find_items():
    keywords = request.args.get("keywords")
    min_price = request.args.get("minPrice")
    max_price = request.args.get("maxPrice")
    condition = request.args.get("condition")
    returns_accepted = request.args.get("returnsAccepted")
    shipping = request.args.get("shipping")
    sort_order = request.args.get("sortOrder")

    AppID = "YuhangQi-kobytheg-PRD-072b2ae15-7f68941d"

    url = "https://svcs.ebay.com/services/search/FindingService/v1"

    headers = {
        "X-EBAY-SOA-OPERATION-NAME": "findItemsAdvanced",
        "X-EBAY-SOA-SERVICE-VERSION": "1.0.0",
        "X-EBAY-SOA-SECURITY-APPNAME": AppID,
        "X-EBAY-SOA-RESPONSE-DATA-FORMAT": "JSON",
        "REST-PAYLOAD":"",
    }

    params = {
        "keywords": keywords,
        "sortOrder": sort_order or "BestMatch",
    }

    # add all conditional variables to params 
    conditional_vars = []

    # min and max price
    if min_price:
        conditional_vars.append({
            "name": "MinPrice",
            "value": [min_price],
            "paramName": "Currency",
            "paramValue": "USD",
        })
    if max_price:
        conditional_vars.append({
            "name": "MaxPrice",
            "value": [max_price],
            "paramName": "Currency",
            "paramValue": "USD",
        })

    # condition
    if condition:
        conditional_vars.append({
            "name": "Condition",
            "value": condition.split(",")
        })

    # returns
    if returns_accepted:
        conditional_vars.append({
            "name": "ReturnsAcceptedOnly",
            "value": [returns_accepted]
        })
    
    # shipping
    if shipping:
        if "freeShipping" in shipping:
            conditional_vars.append({
                "name": "FreeShippingOnly",
                "value": ["true"]
            })
        if "expeditedShipping" in shipping:
            conditional_vars.append({
                "name": "ExpeditedShippingType",
                "value": ["Expedited"]
            })

    # add all variables to params
    for i, param in enumerate(conditional_vars):
         for j, value in enumerate(param["value"]):
            params[f"itemFilter({i}).name"] = param["name"]
            params[f"itemFilter({i}).value({j})"] = value

    response = requests.get(url, headers=headers, params=params)
    return response.text

@app.route("/findsingleitem", methods=["GET"])
def find_single_item():
    itemId = request.args.get("itemId")
    AppID = "YuhangQi-kobytheg-PRD-072b2ae15-7f68941d"
    AppSecret = "PRD-72b2ae153f1f-65a5-44d1-933f-83da"

    OAuth = OAuthToken(AppID, AppSecret)
    OAuth_token = OAuth.getApplicationToken()

    url = "https://open.api.ebay.com/shopping"

    headers = {
        "X-EBAY-API-IAF-TOKEN": OAuth_token,
    }

    params = {
        "callname": "GetSingleItem",
        "responseencoding": "JSON",
        "appid": AppID,
        "siteid": "0",
        "version": "967",
        "ItemID": itemId,
        "IncludeSelector": "Description,Details,ItemSpecifics",
    }

    response = requests.get(url, headers=headers, params=params)
    return response.text

if __name__ == "__main__":
    # This is used when running locally only. When deploying to Google App
    # Engine, a webserver process such as Gunicorn will serve the app. You
    # can configure startup instructions by adding `entrypoint` to app.yaml.
    # app.run(host="127.0.0.1", port=8080, debug=True)
    app.run()
# [END gae_python3_app]
# [END gae_python38_app]
