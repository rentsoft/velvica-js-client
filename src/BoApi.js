import AbstractApi from "./AbstractApi";
import Fetcher from "./util/Fetcher";
import {Options} from "./index";
import {AgentTypes, DiscountStatuses, DiscountStatusesForUser, PersonalCodeStatuses, ServerStatuses} from "./enum";

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
      statusForUser: Options.enumValue(DiscountStatusesForUser),
      softGroup: Options.stringValue(),
    };

    return this.fetch(
      'discount/list',
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
      discountId: Options.stringValue(),
      search: Options.stringValue(),
      status: Options.enumValue(PersonalCodeStatuses),
    };

    return this.fetch(
      'personal_code/list',
      {method: 'GET'},
      Options.create(options, this.withPagination(schema))
    );
  }

  /**
   * @param {string} id
   * @returns {Promise<Response>}
   */
  async deletePersonalCode(id) {
    return this.fetch(`personal_code/${id}`, {method: 'DELETE'});
  }

  /**
   * @param {string} id
   * @returns {Promise<Response>}
   */
  async suspendPersonalCode(id) {
    return this.fetch(`personal_code/${id}/suspend`, {method: 'POST'});
  }

  /**
   * @param {object} formData
   * @returns {Promise<Response>}
   */
  async postPersonalCode(formData) {
    return this.fetch('personal_code', {method: 'POST', body: formData});
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
