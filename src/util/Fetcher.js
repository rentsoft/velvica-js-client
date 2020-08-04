export default class Fetcher
{
  constructor() {
    this.errorHandler = undefined;
    this.connectionFailedHandler = undefined;
  }

  async fetch(...params) {
    try {
      const fetchResult = await fetch(...params);
      const responseJson = await fetchResult.json();
      if (this.errorHandler !== undefined && !fetchResult.ok) {
        this.errorHandler(fetchResult, responseJson);
      }
      return responseJson;
    } catch (err) {
      if (this.connectionFailedHandler !== undefined) {
        this.connectionFailedHandler(err);
      } else {
        throw err;
      }
    }
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
