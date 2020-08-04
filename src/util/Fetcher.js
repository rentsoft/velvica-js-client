export default class Fetcher
{
  constructor() {
    this.errorHandler = undefined;
  }

  async fetch(...params) {
    const fetchResult = await fetch(...params);
    const responseJson = await fetchResult.json();
    if (this.errorHandler !== undefined && !fetchResult.ok) {
      this.errorHandler(fetchResult.status, responseJson);
    }
    return responseJson;
  }

  /**
   * @param {ErrorHandlerCallback} errorHandler
   */
  setErrorHandler(errorHandler) {
    this.errorHandler = errorHandler;
  }
}
