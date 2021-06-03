import {AbstractApi} from "./AbstractApi";
import Fetcher from "./util/Fetcher";
import * as FormData from "form-data"

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

  async fetchCertInfo(cert, email, verificationCode) {
    const formData = new FormData();
    formData.append('cert_value', cert);
    if (email !== undefined) {
      formData.append('cert_email', email);
    }
    if (verificationCode !== undefined) {
      formData.append('cert_email_verification_code', verificationCode);
    }

    return await this.fetch('v1/cert/info',
      {
        method: 'POST',
        body: formData
      }
    );
  }

  async activateCert(cert, email, verificationCode) {
    const formData = new FormData();
    formData.append('cert_value', cert);
    if (email !== undefined) {
      formData.append('cert_email', email);
    }
    if (verificationCode !== undefined) {
      formData.append('cert_email_verification_code', verificationCode);
    }

    return await this.fetch('v1/cert/activate',
      {
        method: 'POST',
        body: formData
      }
    );
  }
}
