import AbstractApi from "./AbstractApi";
import Fetcher from "./util/Fetcher";

/**
 * @enum {string}
 * @readonly
 */
export const VPSStateChange = Object.freeze({
  TURN_ON: 'turnOn',
  SHUTDOWN: 'shutdown',
  SOFT_REBOOT: 'softReboot',
  HARD_REBOOT: 'hardReboot',
});

/**
 * @enum {string}
 * @readonly
 */
export const VPSLogFilter = Object.freeze({
  COUNT_50: '50',
  COUNT_100: '100',
  COUNT_ALL: 'all'
});

export class ControlPanelApi extends AbstractApi {
  /**
   * @param {string} endpoint
   * @param {string} agSign
   * @param {string} subscriptionId
   * @param {Fetcher} [fetcher]
   */
  constructor({endpoint, agSign, subscriptionId}, fetcher = new Fetcher()) {
    super({endpoint, agSign}, fetcher);
    this.subscriptionId = subscriptionId;
  }

  /**
   * This function is here only to override its JSDoc.
   *
   * @param {(ControlPanelApiPerformerCallback|PerformerCallback)} performer
   * @param {(ControlPanelApiErrorHandlerCallback|ErrorHandlerCallback)} errorHandler
   * @returns {Promise<Response>}
   */
  withErrorHandling(performer, errorHandler) {
    return super.withErrorHandling(performer, errorHandler);
  }

  /**
   * @callback ControlPanelApiPerformerCallback
   * @param {ControlPanelApi} api
   */
  /**
   * @callback ControlPanelApiErrorHandlerCallback
   *
   * @param {Response} response
   * @param {({detail}|any)} responseBody
   */

  /**
   * @protected
   * @param {string} action
   * @param {object} urlParams
   * @returns {string}
   */
  buildRequestPath(action, urlParams) {
    return `subscription/${this.subscriptionId}/${action}`;
  }

  async fetchInfo() {
    return this.fetch('info', {method: 'GET'});
  }

  async fetchImages() {
    return this.fetch('image', {method: 'GET'});
  }

  /**
   * @param {VPSRebuildOptions} options
   * @returns {Promise<Response>}
   */
  async rebuild(options) {
    options = {
      ...options
    };

    if (!options.imageUUID) {
      throw new Error('Cannot rebuild without imageUUID specified.');
    }

    const formData = new FormData();
    formData.append('image_uuid', options.imageUUID);
    if (options.sshKeyIds !== undefined) {
      formData.append('ssh_keys', options.sshKeyIds.join(','))
    }

    if (options.newSshKey !== undefined) {
      formData.append('new_ssh_key_name', options.newSshKey.name);
      formData.append('new_ssh_key_value', options.newSshKey.value);
    }

    if (options.password !== undefined) {
      formData.append('password', options.password);
    }

    if (options.allowPasswordLogin !== undefined) {
      formData.append('allow_password_login', options.allowPasswordLogin ? 'true' : 'false');
    }

    return this.fetch(
      'rebuild',
      {
        method: 'POST',
        body: formData
      }
    );
  }

  /**
   * @param {VPSStateChange} stateChange
   * @returns {Promise<Response>}
   */
  async changeState(stateChange) {
    if (!Object.values(VPSStateChange).includes(stateChange)) {
      throw new Error(`Action change ${stateChange} is not allowed!`);
    }

    const mapping = {
      [VPSStateChange.SOFT_REBOOT]: 'reboot/soft',
      [VPSStateChange.HARD_REBOOT]: 'reboot/hard',
      [VPSStateChange.SHUTDOWN]: 'shutdown',
      [VPSStateChange.TURN_ON]: 'start'
    };

    return this.fetch(mapping[stateChange], {method: 'POST'});
  }

  async fetchConsoleUrl() {
    return this.fetch('console/url', {method: 'GET'});
  }

  /**
   * @param {VPSLogFilter} logsCount
   * @returns {Promise<Response>}
   */
  async fetchLogs(logsCount) {
    if (!Object.values(VPSLogFilter).includes(logsCount)) {
      throw new Error(`Log count ${logsCount} is not allowed!`);
    }

    return this.fetch(`console/logs/${logsCount}`, {method: 'GET'});
  }

  /**
   * @typedef VPSRebuildOptions
   * @type {object}
   * @property {string} imageUUID
   * @property {string[]} [sshKeyIds]
   * @property {{name: string, value: string}} [newSshKey]
   * @property {string} [password]
   * @property {boolean} [allowPasswordLogin]
   */
};
