var axios = require('axios');

export default async function handler(req, res) {
    var config = {
      method: 'GET',
      url: 'https://api.contentstack.io/v3/content_types',
      headers: { 
        'authorization': process?.env?.AUTHORIZATION, 
        'api_key': process?.env?.API_KEY,
      }
    };

    axios(config)
    .then(function (response) {
      res.status(200).json(response.data);
    })
    .catch(function (error) {
      console.error('Error in get-content-type api',error)
      res.status(500).json({});
    });
}  
