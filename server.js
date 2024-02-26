// Import external libraries
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const axios = require('axios');
const btoa = require('btoa');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
// OauthToken Class
class OAuthToken {
    constructor(client_id, client_secret) {
        this.client_id = client_id;
        this.client_secret = client_secret;
    }

    getBase64Encoding() {
        const credentials = `${this.client_id}:${this.client_secret}`;
        const base64String = btoa(credentials);
        return base64String;
    }

    async getApplicationToken() {
        const url = 'https://api.ebay.com/identity/v1/oauth2/token';

        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${this.getBase64Encoding()}`
        };

        const data = new URLSearchParams();
        data.append('grant_type', 'client_credentials');
        data.append('scope', 'https://api.ebay.com/oauth/api_scope');

        try {
            const response = await axios.post(url, data, { headers });
            return response.data.access_token;
        } catch (error) {
            console.error('Error obtaining access token:', error);
            throw error;
        }
    }
}
// Create express instance
const app = express();
const public_path = __dirname + "/frontend/dist/frontend";

// Basic settings
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(public_path));

app.get("/", (req, res) => {
    res.sendFile(path.join(public_path + "/index.html"));
});

app.get("/search", (req, res) => {
    res.redirect('/');
});

// Finditems API
app.get('/finditems', function(req, res) {
    const keywords = req.query.keywords;
    const category = req.query.categoryId;
    const condition = req.query.condition;
    const shipping = req.query.condition;
    const distance = req.query.distance;
    const zip = req.query.zip;

    const AppID = "YuhangQi-kobytheg-PRD-072b2ae15-7f68941d";

    const url = "https://svcs.ebay.com/services/search/FindingService/v1";

    const headers = {
        "X-EBAY-SOA-OPERATION-NAME": "findItemsAdvanced",
        "X-EBAY-SOA-SERVICE-VERSION": "1.0.0",
        "X-EBAY-SOA-SECURITY-APPNAME": AppID,
        "X-EBAY-SOA-RESPONSE-DATA-FORMAT": "JSON",
        "REST-PAYLOAD":"",
    };

    let params = {
        "paginationInput.entriesPerPage": 50,
        "keywords": keywords,
        "buyerPostalCode": zip,
    };
    
    if (category != 0) {
        params["categoryId"] = category;
    }

    let conditional_vars = [];
    conditional_vars.push({
        "name": "MaxDistance",
        "value": [distance]
    });
    conditional_vars.push({
        "name": "HideDuplicateItems",
        "value": ["true"]
    });
    if (condition) {
        conditional_vars.push({
            "name": "Condition",
            "value": condition.split(",")
        });
    }
    if (shipping) {
        if (shipping.includes("freeShipping")) {
            conditional_vars.push({
                "name": "FreeShippingOnly",
                "value": ["true"]
            });
        }
        if (shipping.includes("localPickup")) {
            conditional_vars.push({
                "name": "LocalPickupOnly",
                "value": ["true"]
            });
        }
    }

    for (let i = 0; i < conditional_vars.length; i++) {
        for (let j = 0; j < conditional_vars[i].value.length; j++) {
            params[`itemFilter(${i}).name`] = conditional_vars[i].name;
            params[`itemFilter(${i}).value(${j})`] = conditional_vars[i].value[j];
        }
    }

    params['outputSelector(0)'] = "SellerInfo";
    params['outputSelector(1)'] = "StoreInfo";

    request.get({
        url: url,
        headers: headers,
        qs: params
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            res.send(body);
        } else {
            res.send(error);
        }
    });
});

// Find single item API
app.get('/findsingleitem', function(req, res) {
    const itemId = req.query.itemId;
    const AppID = 'YuhangQi-kobytheg-PRD-072b2ae15-7f68941d';
    const AppSecret = 'PRD-72b2ae153f1f-65a5-44d1-933f-83da';
  
    const oauthToken = new OAuthToken(AppID, AppSecret);
    oauthToken.getApplicationToken()
    .then((accessToken) => {
        const OAuth_token = accessToken;
        const url = 'https://open.api.ebay.com/shopping';
        const headers = {
          'X-EBAY-API-IAF-TOKEN': OAuth_token,
        };
        const params = {
          'callname': 'GetSingleItem',
          'responseencoding': 'JSON',
          'appid': AppID,
          'siteid': '0',
          'version': '967',
          'ItemID': itemId,
          'IncludeSelector': 'Description,Details,ItemSpecifics',
        };
  
        request.get({
          url: url,
          headers: headers,
          qs: params,
        }, function(error, response, body) {
          if (!error && response.statusCode == 200) {
            res.send(body);
          } else {
            res.send(error);
          }
        });
    })  
    .catch((error) => {
    console.log('Access Token error', error.message);
    });
  });

  // Find similar items API
app.get('/findsimilaritems', function(req, res) {
    const itemId = req.query.itemId;
    const AppID = 'YuhangQi-kobytheg-PRD-072b2ae15-7f68941d';
  
    const url = "https://svcs.ebay.com/MerchandisingService";

    let params = {
        "OPERATION-NAME": "getSimilarItems",
        "SERVICE-NAME": "MerchandisingService",
        "SERVICE-VERSION": "1.1.0",
        "CONSUMER-ID": AppID,
        "RESPONSE-DATA-FORMAT": "JSON",
        "REST-PAYLOAD":"",
        "itemId": itemId,
        "maxResults": 20,
    };
 
    request.get({
        url: url,
        qs: params
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            res.send(body);
        } else {
            res.send(error);
        }
    });
});

// Autocomplete API
app.get('/autocomplete', function(req, res) {
    const zipInput = req.query.zipInput;
    const url = 'http://api.geonames.org/postalCodeSearchJSON';
    const userName = 'yuhangqi15';
    const params = {
        'postalcode_startsWith': zipInput,
        'maxRows': '5',
        'username': userName,
        'country': "US"
    }

    request.get({
        url: url,
        qs: params
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            res.send(body);
        } else {
            res.send(error);
        }
    });
});

// MongoDB API
const uri = "mongodb+srv://yuhangqi:L49ri3NmyZNalevm@cluster0.btqf0bb.mongodb.net/?retryWrites=true&w=majority";
let dbPromise = MongoClient.connect(uri)
    .then(client => {
        return client.db("assignment3");
    })
    .catch(err => {
        console.error(err);
    });

// Fetch full Wishlist
app.get('/wishlist-fetech', (req, res) => {
    dbPromise.then(async db => {
        const result = await db.collection('wishlist').find().toArray();
        console.log(result);
        res.send(result);
    });
});
    // Add to wishlist
app.post('/wishlist-operate', (req, res) => {
    const product = req.body.product;
    console.log(req.body)
    if (req.body.action == "add") {
        dbPromise.then(async db => {
            const result = await db.collection('wishlist').insertOne(product);
            console.log(result);
            res.status(result);
        });
    }
    // Remove item from Wishlist
    else {
        dbPromise.then(async db => {
            const result = db.collection('wishlist').deleteOne({itemId: product.itemId})
            console.log(result);
            res.status(result);
        });
    }
});

app.get('/imagesearch', function(req, res) {
    const title = req.query.title;
    const engineId = '047142c648f60437d';
    const APIKey = 'AIzaSyB90Nq_9A8u_dxYPZPsFIJq9SY3pE2lSoQ';
  
    
    const url = 'https://www.googleapis.com/customsearch/v1';
    const params = {
        'q': title,
        'cx': engineId,
        'imgSize': 'huge',
        'num': 8,
        'searchType': 'image',
        'key': APIKey,
    };

    request.get({
        url: url,
        qs: params,
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
        res.send(body);
        } else {
        res.send(error);
        }
    });
});

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});