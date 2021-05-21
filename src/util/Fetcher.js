import fetch from 'node-fetch';

export default class Fetcher {
  constructor() {
    this.errorHandler = undefined;
    this.connectionFailedHandler = undefined;
    this.oauthParams = undefined;
    this.bearerToken = undefined;
  }

  async fetch(url, params) {
    let fetchResult;
    let responseJson;

    // Override Accept header.
    params = {
      ...params || {},
      headers: {
        ...(params && params.headers) ? params.headers : {},
        Accept: 'application/json'
      },
    };

    if (this.oauthParams !== undefined && this.bearerToken === undefined) {
      this.bearerToken = await this.getNewBearerToken();
      params.headers.Authorization = `Bearer: ${this.bearerToken}`;
    }

    try {
      fetchResult = await fetch(url, {...params, ...(this.controller ? {signal: this.controller.signal} : {})});
      responseJson = await fetchResult.json();
    } catch (err) {
      if (this.connectionFailedHandler !== undefined) {
        this.connectionFailedHandler(err);
      } else {
        throw err;
      }
    }

    if (this.errorHandler !== undefined && !fetchResult.ok) {
      this.errorHandler(fetchResult, responseJson);
    }

    return responseJson;
  }

  /**
   * @param {ErrorHandlerCallback} errorHandler
   */
  setErrorHandler(errorHandler) {
    this.errorHandler = errorHandler;
  }

  setController(controller) {
    this.controller = controller;
  }

  /**
   * @param {ConnectionFailedHandlerCallback} connectionFailedHandler
   */
  setConnectionFailedHandler(connectionFailedHandler) {
    this.connectionFailedHandler = connectionFailedHandler;
  }

  useOauthParams(oauthParams) {
    this.oauthParams = oauthParams;
  }

  async getNewBearerToken() {
    const fetchResult = await fetch(
      this.oauthParams.endpoint,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
          client_id: this.oauthParams.clientId,
          client_secret: this.oauthParams.clientSecret,
          grant_type: this.oauthParams.grantType,
        })
      }
    );
    const responseJson = await fetchResult.json();

    return responseJson.access_token;
  }
}
