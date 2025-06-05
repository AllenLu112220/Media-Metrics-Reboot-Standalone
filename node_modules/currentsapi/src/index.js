'use strict';
/**
 * Official module to Currents API 
 * https://currentsapi.services/en
 *
 * API access to international news
 *
 */

const fetch = require('node-fetch'),
	qs = require('querystring'),
	api_domain = 'https://api.currentsapi.services',
	latest_url = '/v1/latest-news',
	search_url = '/v1/search';

let API_KEY; // Client api key

class CurrentsAPI {
	constructor(apiKey) {
		if (!apiKey) 
			throw new Error('No API key specified');
		API_KEY = apiKey;
	}

	latestNews(...args) {
		const { params, options, cb } = splitArgsIntoOptionsAndCallback(args),
		url = createUrlFromEndpointAndOptions(latest_url, params);
		
		return getDataFromWeb(url, options, API_KEY, cb);
	}


	search(...args) {
		const { params, options, cb } = splitArgsIntoOptionsAndCallback(args),
		url = createUrlFromEndpointAndOptions(search_url, params);
		
		return getDataFromWeb(url, options, API_KEY, cb);
	}
}

/**
 * Takes a variable-length array that represents arguments to a function and attempts to split it into
 * an 'options' object and a 'cb' callback function.
 * @param {Array}   args The arguments to the function
 * @return {Object}
 */
function splitArgsIntoOptionsAndCallback(args) {
	let params, options, cb;
	if (args.length > 1) {
		params = args[0];

		const possibleCb = args[args.length - 1];
		if ('function' === typeof possibleCb) {
			cb = possibleCb;
			options = args.length === 3 ? args[1] : undefined;
		} else {
			options = args[1];
		}
	} else if ('object' === typeof args[0]) {
		params = args[0];
	}
	else if ('function' === typeof args[0]) {
		cb = args[0];
	}
	
	return { params, options, cb };
}

/**
 * Creates a url string from an endpoint and an options object by appending the endpoint
 * to the global "host" const and appending the options as querystring parameters.
 * @param {String} endpoint
 * @param {Object} [options]
 * @return {String}
 */
function createUrlFromEndpointAndOptions(endpoint, options) {
	const query = qs.stringify(options);
	const baseURL = `${api_domain}${endpoint}`;
	return query ? `${baseURL}?${query}` : baseURL;
}


class CurrentsAPIException extends Error {
	constructor(err) {
		super();
		this.name = `[CurrentsAPI Error] ${err.code}`;
		this.message = err.message;
	}
}
/**
 * Takes a URL string and returns a Promise containing
 * a buffer with the data from the web.
 * @param  {String} url      A URL String
 * @param  {String} apiKey   (Optional) A key to be used for authentication
 * @return {Promise<Buffer>} A Promise containing a Buffer
 */
function getDataFromWeb(url, options, apiKey, cb) {
	let useCallback = 'function' === typeof cb;
	const reqOptions = { headers: {} };
	if (apiKey) {
		reqOptions.headers['Authorization'] = apiKey;
	}
	return fetch(url, reqOptions).then(res => Promise.all([res, res.json()])).then(([res, body]) => {
		if (body.status === 'error') {
			throw new CurrentsAPIException(body);
		}

		if (options && options.showHeaders) {
			if (useCallback) return cb(null, { headers: res.headers, body });
			return { headers: res.headers, body };
		}
		if (useCallback) return cb(null, body);
		return body;
	}).catch(err => {
		if (useCallback) return cb(err);
		throw err;
	});
}


module.exports = CurrentsAPI;

