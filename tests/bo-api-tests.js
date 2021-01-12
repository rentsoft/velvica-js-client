import {describe, it, before} from "mocha";
import {expect} from 'chai';
import {BoApi, ControlPanelApi, VPSLogFilter, VPSStateChange} from "../src";
import {createFetcherStub} from "./util";

const ENDPOINT = 'ENDPOINT';
const SESSID = 'SESSION';

describe('BoApi', function () {
  /** @var {BoApi} api */
  let api = null;

  const tests = {
    'fetchBrAgents (error)': {
      action: () => api.fetchBrAgents({ search: '123', agentType: '???' }),
      error: 'Failed to validate: agentType is invalid.'
    },
    'fetchBrAgents (success)': {
      action: () => api.fetchBrAgents({ search: '123', agentType: 'provider' }),
      expected: {
        url: 'ENDPOINT/api/br_agent/list?SESSID=SESSION&search=123&agent_type=provider',
        params: {method: 'GET'}
      }
    },
    'fetchSoftGroups (error)': {
      action: () => api.fetchSoftGroups({ search: 0.01 }),
      error: 'Failed to validate: search is invalid.'
    },
    'fetchSoftGroups (success)': {
      action: () => api.fetchSoftGroups({ search: '456' }),
      expected: {
        url: 'ENDPOINT/api/soft_group/list?SESSID=SESSION&search=456',
        params: {method: 'GET'}
      }
    },
    'fetchDevelopers (error)': {
      action: () => api.fetchDevelopers({ search: true }),
      error: 'Failed to validate: search is invalid.'
    },
    'fetchDevelopers (success)': {
      action: () => api.fetchDevelopers({ search: '789' }),
      expected: {
        url: 'ENDPOINT/api/developer/list?SESSID=SESSION&search=789',
        params: {method: 'GET'}
      }
    },
    'fetchBrSofts (error)': {
      action: () => api.fetchBrSofts({ search: null }),
      error: 'Failed to validate: search is invalid.'
    },
    'fetchBrSofts (success)': {
      action: () => api.fetchBrSofts({ search: '123', developerId: '100000000000000001' }),
      expected: {
        url: 'ENDPOINT/api/br_soft/list?SESSID=SESSION&search=123&developer_id=100000000000000001',
        params: {method: 'GET'}
      }
    },
    'fetchSofts (error)': {
      action: () => api.fetchSofts({ search: -5 }),
      error: 'Failed to validate: search is invalid.'
    },
    'fetchSofts (success)': {
      action: () => api.fetchSofts({ search: '456', brSoftId: '100000000000000002' }),
      expected: {
        url: 'ENDPOINT/api/soft/list?SESSID=SESSION&search=456&br_soft_id=100000000000000002',
        params: {method: 'GET'}
      }
    },
    'fetchServices (error)': {
      action: () => api.fetchServices({ status: 'whatever' }),
      error: 'Failed to validate: status is invalid.'
    },
    'fetchServices (success)': {
      action: () => api.fetchServices({ search: '789', softId: '100000000000000003', status: 'new' }),
      expected: {
        url: 'ENDPOINT/api/service/list?SESSID=SESSION&search=789&soft_id=100000000000000003&status=new',
        params: {method: 'GET'}
      }
    },
    'fetchSubscriptions (error)': {
      action: () => api.fetchSubscriptions({ uuid: [] }),
      error: 'Failed to validate: uuid is invalid.'
    },
    'fetchSubscriptions (success)': {
      action: () => api.fetchSubscriptions({ uuid: 'some_uuid' }),
      expected: {
        url: 'ENDPOINT/api/subscription/list?SESSID=SESSION&uuid=some_uuid',
        params: {method: 'GET'}
      }
    },
    'fetchDiscounts (error)': {
      action: () => api.fetchDiscounts({ status: 'random' }),
      error: 'Failed to validate: status is invalid.'
    },
    'fetchDiscounts (error 2)': {
      action: () => api.fetchDiscounts({ statusForUser: 'random' }),
      error: 'Failed to validate: statusForUser is invalid.'
    },
    'fetchDiscounts (success)': {
      action: () => {
        return api.fetchDiscounts({
          search: '1',
          uuidOrEmail: '2',
          status: 'active',
          statusForUser: 'used',
          softGroup: 'group'
        });
      },
      expected: {
        url: 'ENDPOINT/api/discount/list?SESSID=SESSION&search=1&uuid_or_email=2' +
          '&status=active&status_for_user=used&soft_group=group',
        params: {method: 'GET'}
      }
    }
  };

  before(() => {
    process.env.NODE_ENV = 'production';
  });

  Object.entries(tests).forEach(([testName, {action, expected, error}]) => {
    it(testName, async () => {
      const fetcher = createFetcherStub();

      api = new BoApi({
        endpoint: ENDPOINT,
        sessionRestore: SESSID,
      }, fetcher);

      if (error) {
        action().catch(err => expect(err.message).to.equal(error));
      } else {
        await action();
        expect(fetcher.result).deep.equal({
          url: expected.url
            .replace('[E]', ENDPOINT)
            .replace('[S]', SESSID),
          params: expected.params
        });
      }
    });
  });
});
