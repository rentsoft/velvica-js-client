import {AbstractApi} from "./AbstractApi";
import Fetcher from "./util/Fetcher";

export class CertApi extends AbstractApi {
  /**
   * @param {string} endpoint
   * @param {string} brAgentId
   * @param {string} clientId
   * @param {string} clientSecret
   * @param fetcher
   */
  constructor(
      {endpoint, salesChannelId, clientId, clientSecret},
      fetcher = new Fetcher()
  ) {
    if (clientId !== '') {
      fetcher.useOauthParams({
        endpoint: endpoint + '/oauth',
        clientId,
        clientSecret,
        grantType: 'client_credentials'
      })
    }
    super(endpoint, fetcher);
    this.salesChannelId = salesChannelId;
  }

  /**
   * @protected
   * @param {string} action
   * @returns {string}
   */
  buildRequestPath(action) {
    return `${action}?sales_channel_id=${this.salesChannelId}`;
  }

  /**
   * This function is here only to override its JSDoc.
   *
   * @param {(CertApiPerformerCallback|PerformerCallback)} performer
   * @param {(CertApiErrorHandlerCallback|ErrorHandlerCallback)} errorHandler
   * @returns {Promise<Response>}
   */
  withErrorHandling(performer, errorHandler) {
    return super.withErrorHandling(performer, errorHandler);
  }

  async certInfo(cert, email, verificationCode) {
    return await this.fetch('cert/info',
      {
        method: 'POST',
        body:  JSON.stringify(
        {
            cert,
            email,
            verificationCode,
          }
        )
      }
    );
  }

  async certActivate(cert, email, verificationCode) {
    return await this.fetch('cert/activate',
      {
        method: 'POST',
        body:  JSON.stringify(
          {
            cert,
            email,
            verificationCode,
          }
        )
      }
    );
  }
}
