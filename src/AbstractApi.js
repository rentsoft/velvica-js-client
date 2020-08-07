import Fetcher from "./util/Fetcher";

export default class AbstractApi {
  /**
   * @param {string} endpoint
   * @param {string} agSign - Ag query string used for signing the URL
   * @param {Fetcher} fetcher
   */
  constructor({ endpoint, agSign }, fetcher = new Fetcher()) {
    this.endpoint = endpoint;
    this.agSign = agSign;
    this.fetcher = fetcher;
  }

  /**
   * @protected
   * @param {object} urlParams
   * @param {string} action
   * @returns {string}
   */
  buildRequestPath(action, urlParams) {
    return action;
  }

  /**
   * @param {PerformerCallback} performer
   * @param {ErrorHandlerCallback} errorHandler
   * @returns {*}
   */
  withErrorHandling(performer, errorHandler) {
    const apiClone = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
    apiClone.fetcher.setErrorHandler(errorHandler);
    return performer(apiClone);
  }

  /**
   * Allows to bypass CORS when running in development environment.
   * A special middleware on the server should handle that.
   *
   * @param action
   * @param args
   * @param urlParams
   * @returns {Promise<Response>}
   * @protected
   */
  async fetch(action, args, urlParams) {
    const requestPath = `${this.endpoint}/${this.buildRequestPath(action, urlParams)}`;
    const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
    const urlPostfix = this.agSign + (isDev ? '&debug=1' : '');

    const requestPathContainsGetParams = requestPath.includes('?');
    const glueSign = requestPathContainsGetParams ? '&' : '?';

    return await this.fetcher.fetch(`${requestPath}${glueSign}${urlPostfix}`, args);
  }

  /**
   * @callback PerformerCallback
   * @param {AbstractApi} api
   */
  /**
   * @callback ErrorHandlerCallback
   * @param {Response} response
   * @param {object} responseBody
   */
}
