# currentsapi

A node interface for CurrentsAPI.

Latest news headlines and metadata in JSON from 13,000 popular news sites. Powered by Currents Api

In order to use this package you need to register at [https://currentsapi.services/en/register](https://currentsapi.services/en/register)

Please refer to our [documentation](https://currentsapi.services/en/documents) to see details about how to use the API. The convenience functions provided by this module is simply passing your options along as querystring parameters to the REST API, so the [documentation](https://currentsapi.services/en/documents) is totally valid. 

There are some usage examples below to see how these options should be passed in.

If you use this in a project, kindly add an attribution : 'powered by Currents API' with links back to Currents Api.

## Add to your project
```shell
$ npm i -s currentsapi
```

## Test
```shell
$ API_KEY=<your api key> npm test
```

## Example usage of API
All methods support promises and node-style callbacks.
```js
const CurrentsAPI = require('currentsapi');
const currentsapi = new CurrentsAPI('YOUR_API_KEY');

// To query latest news
// All options passed to search are optional
currentsapi.search({
  keywords: 'Trump',
  language: 'en',
  country: 'US'
}).then(response => {
  console.log(response);
  /*
    {
      status: "ok",
      news: [...]
    }
  */
});


If you like this package you can follow us at [Twitter](https://twitter.com/currentsapi)
