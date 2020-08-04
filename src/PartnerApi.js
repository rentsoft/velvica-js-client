import AbstractApi from "./AbstractApi";
import Fetcher from "./util/Fetcher";

export class PartnerApi extends AbstractApi {
  /**
   * @param {string} endpoint
   * @param {string} agSign
   * @param {string} brAgentUserUuid
   * @param {string} brAgentId
   * @param fetcher
   */
  constructor({endpoint, agSign, brAgentUserUuid, brAgentId}, fetcher = new Fetcher()) {
    super({endpoint, agSign}, fetcher);
    this.brAgentUserUuid = brAgentUserUuid;
    this.brAgentId = brAgentId;
  }

  /**
   * @protected
   * @param {string} action
   * @returns {string}
   */
  buildRequestPath(action) {
    return `users/${this.brAgentUserUuid}/${action}?sales_channel_id=${this.brAgentId}`;
  }

  /**
   * This function is here only to override its JSDoc.
   *
   * @param {(PartnerApiPerformerCallback|PerformerCallback)} performer
   * @param {(PartnerApiErrorHandlerCallback|ErrorHandlerCallback)} errorHandler
   * @returns {Promise<Response>}
   */
  withErrorHandling(performer, errorHandler) {
    return super.withErrorHandling(performer, errorHandler);
  }

  /**
   * @callback PartnerApiPerformerCallback
   * @param {PartnerApi} api
   */
  /**
   * @callback PartnerApiErrorHandlerCallback
   *
   * @param {number} statusCode
   * @param {({error, detail}|any)} responseBody
   */

  /**
   * @returns {Promise<Response>}
   */
  async fetchSubscriptions() {
    return await this.fetch('subscriptions', {method: 'GET'});
  }

  async fetchSshKeys() {
    return await this.fetch('ssh_keys', {method: 'GET'});
  }

  async createSshKey(name, publicKey) {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('public_key', publicKey);

    return await this.fetch('ssh_keys', {
      method: 'POST',
      body: formData
    });
  }

  async updateSshKey(sshKeyId, name) {
    const formData = new FormData();
    formData.append('name', name);

    return await this.fetch(`ssh_keys/${sshKeyId}`, {
      method: 'PUT',
      body: formData
    });
  }

  async deleteSshKey(sshKeyId) {
    return await this.fetch(
      `ssh_keys/${sshKeyId}`,
      {method: 'DELETE'}
    );
  }

  async fetchVendorLogs(subscriptionId) {
    return await this.fetch(`subscriptions/${subscriptionId}/vendor_logs`, {method: 'GET'});
  }

  async fetchBillingLogs(subscriptionId) {
    return await this.fetch(`subscriptions/${subscriptionId}/billing_logs`, {method: 'GET'});
  }
}
