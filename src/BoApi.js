import AbstractApi from "./AbstractApi";
import Fetcher from "./util/Fetcher";
import {Options} from "./index";
import {
  AgentTypes,
  DiscountStatuses,
  DiscountStatusesForUser,
  PersonalCodeStatuses,
  ServerStatuses,
  ToggleValues
} from "./enum";

export class BoApi extends AbstractApi {
  /**
   * @param {string} endpoint
   * @param {string} sessionRestore
   * @param fetcher
   */
  constructor({endpoint, sessionRestore}, fetcher = new Fetcher()) {
    super(endpoint, fetcher);
    this.sessionRestore = sessionRestore;
  }

  /**
   * @protected
   * @param {string} action
   * @returns {string}
   */
  buildRequestPath(action) {
    return `${action}?SESSID=${this.sessionRestore}`;
  }

  /**
   * This function is here only to override its JSDoc.
   *
   * @param {(BoApiPerformerCallback|PerformerCallback)} performer
   * @param {(BoApiErrorHandlerCallback|ErrorHandlerCallback)} errorHandler
   * @returns {Promise<Response>}
   */
  withErrorHandling(performer, errorHandler) {
    return super.withErrorHandling(performer, errorHandler);
  }

  /**
   * Adds pagination-specific schema options. Returns altered schema.
   *
   * @param {object} schema - original schema
   * @returns {*&{p: NumericSchema}}
   */
  withPagination(schema) {
    return {
      ...schema,
      p: Options.numericValue(),
    };
  }

  /**
   * @param {object} [options]
   * @returns {Promise<Response>}
   */
  async fetchBrAgents(options) {
    const schema = {
      search: Options.stringValue(),
      agentType: Options.enumValue(AgentTypes),
    };

    return this.fetch(
      'br_agent/list',
      {method: 'GET'},
      Options.create(options, this.withPagination(schema))
    );
  }

  /**
   * @param {object} [options]
   * @returns {Promise<Response>}
   */
  async fetchUnapprovedSubscriptions(options) {
    const schema = {
      search: Options.stringValue(),
      brAgentId: Options.stringValue(),
    };

    return this.fetch(
      'subscription_unapproved/list',
      {method: 'GET'},
      Options.create(options, this.withPagination(schema))
    );
  }

  /**
   * @param {object} [options]
   * @returns {Promise<Response>}
   */
  async fetchSoftGroups(options) {
    const schema = {
      search: Options.stringValue(),
    };

    return this.fetch(
      'soft_group/list',
      {method: 'GET'},
      Options.create(options, this.withPagination(schema))
    );
  }

  /**
   * @param {object} [options]
   * @returns {Promise<Response>}
   */
  async fetchDevelopers(options) {
    const schema = {
      search: Options.stringValue(),
    };

    return this.fetch(
      'developer/list',
      {method: 'GET'},
      Options.create(options, this.withPagination(schema))
    );
  }

  /**
   * @param {object} [options]
   * @returns {Promise<Response>}
   */
  async fetchBrSofts(options) {
    const schema = {
      search: Options.stringValue(),
      developerId: Options.stringValue(),
    };

    return this.fetch(
      'br_soft/list',
      {method: 'GET'},
      Options.create(options, this.withPagination(schema))
    );
  }

  /**
   * @param {object} [options]
   * @returns {Promise<Response>}
   */
  async fetchSofts(options) {
    const schema = {
      search: Options.stringValue(),
      brSoftId: Options.stringValue(),
    };

    return this.fetch(
      'soft/list',
      {method: 'GET'},
      Options.create(options, this.withPagination(schema))
    );
  }

  /**
   * @param {object} [options]
   * @returns {Promise<Response>}
   */
  async fetchServices(options) {
    const schema = {
      search: Options.stringValue(),
      softId: Options.stringValue(),
      status: Options.enumValue(ServerStatuses),
    };

    return this.fetch(
      'service/list',
      {method: 'GET'},
      Options.create(options, this.withPagination(schema))
    );
  }

  /**
   * @param {object} [options]
   * @returns {Promise<Response>}
   */
  async fetchSubscriptions(options) {
    const schema = {
      uuid: Options.stringValue(),
    };

    return this.fetch(
      'subscription/list',
      {method: 'GET'},
      Options.create(options, this.withPagination(schema))
    );
  }

  /**
   * @param {object} [options]
   * @returns {Promise<Response>}
   */
  async fetchDiscounts(options) {
    const schema = {
      promocodeOrName: Options.stringValue(),
      uuidOrEmail: Options.stringValue(),
      status: Options.enumValue(DiscountStatuses),
      softGroup: Options.stringValue(),
    };

    return this.fetch(
      'discount/list',
      {method: 'GET'},
      Options.create(options, this.withPagination(schema))
    );
  }

  /**
   * @param {string} userId
   * @param {object} options
   * @returns {Promise<Response>}
   */
  async fetchDiscountsForUser(userId, options) {
    const schema = {
      promocodeOrName: Options.stringValue(),
      statusForUser: Options.enumValue(DiscountStatusesForUser),
      showDisabled: Options.enumValue(ToggleValues),
    };

    return this.fetch(
      `user/${userId}/discount/list`,
      {method: 'GET'},
      Options.create(options, this.withPagination(schema))
    );
  }

  /**
   * @param {object} formData
   * @returns {Promise<Response>}
   */
  async postDiscount(formData) {
    return this.fetch('discount', {method: 'POST', body: formData});
  }

  /**
   * @param {string} id
   * @param {object} formData
   * @returns {Promise<Response>}
   */
  async patchDiscount(id, formData) {
    return this.fetch(`discount/${id}`, {method: 'PATCH', body: formData});
  }

  /**
   * @param {string} id
   * @returns {Promise<Response>}
   */
  async getDiscount(id) {
    return this.fetch(`discount/${id}`, {method: 'GET'});
  }

  /**
   * @param {object} [options]
   * @returns {Promise<Response>}
   */
  async fetchPersonalCodes(options) {
    const schema = {
      promocode: Options.stringValue(),
      status: Options.enumValue(PersonalCodeStatuses),
    };

    return this.fetch(
      `discount/${options.discountId}/personal_code/list`,
      {method: 'GET'},
      Options.create(options, this.withPagination(schema))
    );
  }

  /**
   * @param {object} formData
   * @returns {Promise<Response>}
   */
  async postPersonalCode(formData) {
    return this.fetch('personal_code', {method: 'POST', body: formData});
  }

  /**
   * @returns {Promise<Response>}
   */
  async listSoftGroups() {
    return this.fetch('api/soft_group/list', {method: 'GET'});
  }

  /**
   * @returns {Promise<Response>}
   */
  async listDevelopers() {
    return this.fetch('api/developer/list', {method: 'GET'});
  }

  /**
   * @param {string} developerId
   * @returns {Promise<Response>}
   */
  async listBrSoftsByDeveloperId(developerId) {
    return this.fetch(`api/br_soft/list_by_developer_id/${developerId}`, {method: 'GET'});
  }

  /**
   * @param {string} brSoftId
   * @returns {Promise<Response>}
   */
  async listSoftsByBrSoftId(brSoftId) {
    return this.fetch(`api/soft/list_by_br_soft_id/${brSoftId}`, {method: 'GET'});
  }

  /**
   * @param {string} softId
   * @returns {Promise<Response>}
   */
  async listServicesBySoftId(softId) {
    return this.fetch(`api/service/list_by_soft_id/${softId}`, {method: 'GET'});
  }

  /**
   * @returns {Promise<Response>}
   */
  async listBrAgents() {
    return this.fetch('api/br_agent/list', {method: 'GET'});
  }

  /**
   * @param {string} brAgentId
   * @param {string} uuid
   * @returns {Promise<Response>}
   */
  async listSubscriptionsByBrAgentIdUuid(brAgentId, uuid) {
    return this.fetch(`api/subscription/list_by_br_agent_id_uuid/${brAgentId}/${uuid}`, {method: 'GET'});
  }

  async xhrQuery(url, args = {}, urlParams = {}) {
    let {method, body} = args;
    let query = '';
    if (method === 'POST' && typeof body === 'object') {
      body = Object.entries(body)
        .map(([key, value]) => encodeURIComponent(key) + '=' + encodeURIComponent(value))
        .join('&');
    }
    return this.fetch(
      url,
      {
        method: method ?? 'GET',
        ...(body) ? {body: body} : {},
        ...(method === 'POST') ? {headers: {'Content-type': 'application/x-www-form-urlencoded'}} : {}
      },
      urlParams
    );
  }

  /**
   * @callback BoApiPerformerCallback
   * @param {BoApi} api
   */
  /**
   * @callback BoApiErrorHandlerCallback
   *
   * @param {Response} response
   * @param {({error, detail}|any)} responseBody
   */
}
