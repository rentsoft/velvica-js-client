export default class Fetcher
{
  constructor() {
    this.errorHandler = undefined;
    this.connectionFailedHandler = undefined;
  }

  async fetch(...params) {
    let fetchResult;
    let responseJson;

    try {
      fetchResult = await fetch(...params);
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
