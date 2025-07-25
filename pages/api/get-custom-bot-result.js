var axios = require('axios');
var data = JSON.stringify({
  "blob_url": "https://www.oki.com/eu/printing/about-us/news-room/blog/2023/beyond_the_remake_why_originality_matters/index.html",
  "user_prompt": "Rewrite in a more engaging style, but maintain all important details.",
  "brand_website_url": "https://www.oki.com/global/profile/brand/",
  "content_type": ""
});

var config = {
  method: 'post',
  url: 'https://cms-auto-agent-mobmv.eastus2.inference.ml.azure.com/score',
  headers: { 
    'Key': process?.env?.CUSTOM_BOT_API_KEY, 
    'Content-Type': 'application/json'
  },
  data : data
};

axios(config)
.then(function (response) {
  console.log(JSON.stringify(response.data));
})
.catch(function (error) {
  console.log(error);
});