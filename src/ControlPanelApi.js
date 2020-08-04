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
  RESCUE_LEAVE: 'rescueLeave'
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
   * @param fetcher
   */
  constructor({endpoint, agSign, subscriptionId}, fetcher = new Fetcher()) {
    super({endpoint, agSign}, fetcher);
    this.subscriptionId = subscriptionId;
  }

  /**
   * @protected
   * @param {string} action
   * @returns {string}
   */
  buildRequestPath(action) {
    return `subscription/${this.subscriptionId}/${action}`;
  }

  async fetchInfo() {
    return this.fetch('info', {method: 'GET'});
  }

  async fetchImages() {
    return this.fetch('image', {method: 'GET'});
  }

  /**
   * @param {string} imageUUID
   * @param [string] sshKey
   * @returns {Promise<Response>}
   */
  async rebuild({imageUUID, sshKey}) {
    if (!imageUUID) {
      throw new Error('Cannot rebuild without imageUUID specified.');
    }

    const formData = new FormData();
    formData.append('image_uuid', imageUUID);
    if (sshKey !== undefined) {
      formData.append('ssh_key', sshKey);
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
      [VPSStateChange.TURN_ON]: 'start',
      [VPSStateChange.RESCUE_LEAVE]: 'rescue/leave'
    };

    return this.fetch(mapping[stateChange], {method: 'POST'});
  }

  async startRescue(imageId) {
    return this.fetch(`rescue/start?image_id=${imageId}`, {method: 'POST'});
  }

  async leaveRescue() {
    return this.fetch('rescue/leave', {method: 'POST'});
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
};
