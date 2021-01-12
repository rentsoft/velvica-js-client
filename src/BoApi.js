import AbstractApi from "./AbstractApi";
import Fetcher from "./util/Fetcher";
import {Options} from "./index";

// todo transform enums into enums and export them
const AgentTypes = ['orchestrator', 'reseller', 'tenant', 'partner', 'provider'];
const ServerStatuses = ['active', 'archived', 'new', 'deleted'];
const DiscountStatuses = ['active', 'scheduled', 'deleted'];
const DiscountStatusesForUser = ['used', 'available_personal', 'available_general'];

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
    return `api/${action}?SESSID=${this.sessionRestore}`;
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

  async fetchBrAgents(options) {
    const schema = {
      search: Options.stringValue(),
      agentType: Options.enumValue(AgentTypes),
    };

    return this.fetch(
      'br_agent/list',
      {method: 'GET'},
      Options.create(options, schema)
    );
  }

  async fetchSoftGroups(options) {
    const schema = {
      search: Options.stringValue(),
    };

    return this.fetch(
      'soft_group/list',
      {method: 'GET'},
      Options.create(options, schema)
    );
  }

  async fetchDevelopers(options) {
    const schema = {
      search: Options.stringValue(),
    };

    return this.fetch(
      'developer/list',
      {method: 'GET'},
      Options.create(options, schema)
    );
  }

  async fetchBrSofts(options) {
    const schema = {
      search: Options.stringValue(),
      developerId: Options.stringValue(),
    };

    return this.fetch(
      'br_soft/list',
      {method: 'GET'},
      Options.create(options, schema)
    );
  }

  async fetchSofts(options) {
    const schema = {
      search: Options.stringValue(),
      brSoftId: Options.stringValue(),
    };

    return this.fetch(
      'soft/list',
      {method: 'GET'},
      Options.create(options, schema)
    );
  }

  async fetchServices(options) {
    const schema = {
      search: Options.stringValue(),
      softId: Options.stringValue(),
      status: Options.enumValue(ServerStatuses),
    };

    return this.fetch(
      'service/list',
      {method: 'GET'},
      Options.create(options, schema)
    );
  }

  async fetchSubscriptions(options) {
    const schema = {
      uuid: Options.stringValue(),
    };

    return this.fetch(
      'subscription/list',
      {method: 'GET'},
      Options.create(options, schema)
    );
  }

  async fetchDiscounts(options) {
    const schema = {
      search: Options.stringValue(),
      uuidOrEmail: Options.stringValue(),
      status: Options.enumValue(DiscountStatuses),
      statusForUser: Options.enumValue(DiscountStatusesForUser),
      softGroup: Options.stringValue(),
    };

    return this.fetch(
      'discount/list',
      {method: 'GET'},
      Options.create(options, schema)
    );
  }

  // todo type formData
  // todo test
  async postDiscount(formData) {
    return this.fetch('discount', {method: 'POST', body: formData});
  }

  // todo types
  // todo test
  async patchDiscount(id, formData) {
    return this.fetch('discount/${id}', {method: 'PATCH', body: formData});
  }

  // todo type
  // todo test
  async getDiscount(id) {
    return this.fetch(`discount/${id}`, {method: 'GET'});
  }

  // todo discount_id, search, status
  // todo test
  async fetchPersonalCodes(options) {
    return this.fetch('personal_code/list', {method: 'GET'}, options);
  }

  // todo type
  // todo test
  async deletePersonalCode(id) {
    return this.fetch(`personal_code/${id}`, {method: 'DELETE'});
  }

  // todo type
  // todo test
  async suspendPersonalCode(id) {
    return this.fetch(`personal_code/${id}/suspend`, {method: 'POST'});
  }

  // todo type
  // todo test
  async postPersonalCode(formData) {
    return this.fetch(`discount`, {method: 'POST', body: formData});
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
