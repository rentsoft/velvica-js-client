import Fetcher from "./util/Fetcher";

export default class AbstractApi {
  /**
   * @param {string} endpoint
   * @param {Fetcher} fetcher
   */
  constructor(endpoint, fetcher = new Fetcher()) {
    this.endpoint = endpoint;
    this.fetcher = fetcher;
  }

  /**
   * @protected
   * @param {string} action
   * @returns {string}
   */
  buildRequestPath(action) {
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
    const requestPath = this.buildRequestPath(action);

    let query = '';
    if (urlParams) {
      query = Object.entries(urlParams)
        .map(([key, value]) => encodeURIComponent(key) + '=' + encodeURIComponent(value))
        .join('&');
    }

    const path = this.gluePathAndParams(
      requestPath.startsWith('http')
        ? `${requestPath}`
        : `${this.endpoint}/${requestPath}`,
      query
    );
    const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
    const debugPostfix = isDev ? '&debug=1' : '';

    return await this.fetcher.fetch(
      this.gluePathAndParams(path, debugPostfix),
      args
    );
  }

  /**
   * Glues path and params, such as:
   * - `foo` + `bar=1` = `foo?bar=1`
   * - `foo` + empty string = `foo`
   * - `foo?bar=1` + `abc=2 = `foo?bar=1&abc=2`
   *
   * @param path
   * @param params
   * @returns {string|*}
   */
  gluePathAndParams(path, params) {
    if (params === '') {
      return path;
    }

    const glueSign = path.includes('?') ? '&' : '?';

    return `${path}${glueSign}${params}`;
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
