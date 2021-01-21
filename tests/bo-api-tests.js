import {describe, it, before} from "mocha";
import {expect} from 'chai';
import {
  AgentTypes,
  BoApi,
  DiscountStatuses,
  DiscountStatusesForUser,
  PersonalCodeStatuses,
  ServerStatuses as ServiceStatuses,
  VPSLogFilter,
  VPSStateChange
} from "../src";
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
    'fetchBrAgents (error 2)': {
      action: () => api.fetchBrAgents({ search: '123', p: 'not number' }),
      error: 'Failed to validate: p is invalid.'
    },
    'fetchBrAgents (success)': {
      action: () => api.fetchBrAgents({ search: '123', agentType: AgentTypes.PROVIDER, p: 5 }),
      expected: {
        url: 'ENDPOINT/br_agent/list?SESSID=SESSION&search=123&agent_type=provider&p=5',
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
        url: 'ENDPOINT/soft_group/list?SESSID=SESSION&search=456',
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
        url: 'ENDPOINT/developer/list?SESSID=SESSION&search=789',
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
        url: 'ENDPOINT/br_soft/list?SESSID=SESSION&search=123&developer_id=100000000000000001',
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
        url: 'ENDPOINT/soft/list?SESSID=SESSION&search=456&br_soft_id=100000000000000002',
        params: {method: 'GET'}
      }
    },
    'fetchServices (error)': {
      action: () => api.fetchServices({ status: 'whatever' }),
      error: 'Failed to validate: status is invalid.'
    },
    'fetchServices (success)': {
      action: () => {
        return api.fetchServices({
          search: '789',
          softId: '100000000000000003',
          status: ServiceStatuses.NEW
        });
      },
      expected: {
        url: 'ENDPOINT/service/list?SESSID=SESSION&search=789&soft_id=100000000000000003&status=new',
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
        url: 'ENDPOINT/subscription/list?SESSID=SESSION&uuid=some_uuid',
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
          status: DiscountStatuses.ACTIVE,
          statusForUser: DiscountStatusesForUser.USED,
          softGroup: 'group'
        });
      },
      expected: {
        url: 'ENDPOINT/discount/list?SESSID=SESSION&search=1&uuid_or_email=2' +
          '&status=active&status_for_user=used&soft_group=group',
        params: {method: 'GET'}
      }
    },
    'postDiscount': {
      action: () => api.postDiscount({ discount: '12345' }),
      expected: {
        url: 'ENDPOINT/discount?SESSID=SESSION',
        params: {
          method: 'POST',
          body: {
            discount: '12345'
          },
        }
      }
    },
    'patchDiscount': {
      action: () => api.patchDiscount('100000000000000003', { discount: '890' }),
      expected: {
        url: 'ENDPOINT/discount/100000000000000003?SESSID=SESSION',
        params: {
          method: 'PATCH',
          body: {
            discount: '890'
          },
        }
      }
    },
    'getDiscount': {
      action: () => api.getDiscount('100000000000000004'),
      expected: {
        url: 'ENDPOINT/discount/100000000000000004?SESSID=SESSION',
        params: {method: 'GET'}
      }
    },
    'fetchPersonalCodes (error)': {
      action: () => api.fetchPersonalCodes({ status: 'random' }),
      error: 'Failed to validate: status is invalid.'
    },
    'fetchPersonalCodes (success)': {
      action: () => {
        return api.fetchPersonalCodes({
          discountId: '100000000000000005',
          uuidOrEmail: 'mail@velvica.com',
          status: PersonalCodeStatuses.SUSPENDED,
        });
      },
      expected: {
        url: 'ENDPOINT/personal_code/list?SESSID=SESSION&discount_id=100000000000000005&status=suspended',
        params: {method: 'GET'}
      }
    },
    'fetchPersonalCodes (success, no options)': {
      action: () => {
        return api.fetchPersonalCodes();
      },
      expected: {
        url: 'ENDPOINT/personal_code/list?SESSID=SESSION',
        params: {method: 'GET'}
      }
    },
    'fetchPersonalCodes (undefined option)': {
      action: () => {
        return api.fetchPersonalCodes({
          discountId: undefined,
          search: '123'
        });
      },
      expected: {
        url: 'ENDPOINT/personal_code/list?SESSID=SESSION&search=123',
        params: {method: 'GET'}
      }
    },
    'deletePersonalCode': {
      action: () => api.deletePersonalCode('100000000000000006'),
      expected: {
        url: 'ENDPOINT/personal_code/100000000000000006?SESSID=SESSION',
        params: {method: 'DELETE'}
      }
    },
    'suspendPersonalCode': {
      action: () => api.suspendPersonalCode('100000000000000007'),
      expected: {
        url: 'ENDPOINT/personal_code/100000000000000007/suspend?SESSID=SESSION',
        params: {method: 'POST'}
      }
    },
    'postPersonalCode': {
      action: () => api.postPersonalCode({ code: 'supercode' }),
      expected: {
        url: 'ENDPOINT/personal_code?SESSID=SESSION',
        params: {
          method: 'POST',
          body: {
            code: 'supercode'
          },
        }
      }
    },
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
