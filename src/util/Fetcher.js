export default class Fetcher {
  constructor() {
    this.errorHandler = undefined;
    this.connectionFailedHandler = undefined;
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

  /**
   * @callback ConnectionFailedHandlerCallback
   * @param {Error} error
   */
}
