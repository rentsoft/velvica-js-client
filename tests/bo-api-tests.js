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
import {ToggleValues} from "../src/enum";

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
          promocodeOrName: '1',
          uuidOrEmail: '2',
          status: DiscountStatuses.ACTIVE,
          softGroup: 'group'
        });
      },
      expected: {
        url: 'ENDPOINT/discount/list?SESSID=SESSION&promocode_or_name=1' +
          '&uuid_or_email=2&status=active&soft_group=group',
        params: {method: 'GET'}
      }
    },
    'fetchDiscountsForUser (error)': {
      action: () => api.fetchDiscountsForUser(1, { statusForUser: 'random' }),
      error: 'Failed to validate: statusForUser is invalid.'
    },
    'fetchDiscountsForUser (error 2)': {
      action: () => api.fetchDiscountsForUser(2, { showDisabled: true }),
      error: 'Failed to validate: showDisabled is invalid.'
    },
    'fetchDiscountsForUser (success)': {
      action: () => {
        return api.fetchDiscountsForUser(3, {
          promocodeOrName: 'hey',
          statusForUser: DiscountStatusesForUser.AVAILABLE_GENERAL,
          showDisabled: ToggleValues.ON,
        });
      },
      expected: {
        url: 'ENDPOINT/user/3/discount/list?SESSID=SESSION&promocode_or_name=hey' +
          '&status_for_user=available_general&show_disabled=1',
        params: {method: 'GET'}
      }
    },
    'postDiscount (new)': {
      action: () => api.postDiscount(null, { discount: '12345' }),
      expected: {
        url: 'ENDPOINT/discount/new?SESSID=SESSION',
        params: {
          method: 'POST',
          body: {
            discount: '12345'
          },
        }
      }
    },
    'postDiscount (existing ID)': {
      action: () => api.postDiscount('100000000000000003', { discount: '12345' }),
      expected: {
        url: 'ENDPOINT/discount/100000000000000003?SESSID=SESSION',
        params: {
          method: 'POST',
          body: {
            discount: '12345'
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
    'getNewPersonalCodeData': {
      action: () => api.getNewPersonalCodeData('100000000000000001'),
      expected: {
        url: 'ENDPOINT/discount/100000000000000001/personal_code/new?SESSID=SESSION',
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
          promocode: 'test',
          status: PersonalCodeStatuses.STOPPED,
        });
      },
      expected: {
        url: 'ENDPOINT/discount/100000000000000005/personal_code/list?SESSID=SESSION&promocode=test&status=stopped',
        params: {method: 'GET'}
      }
    },
    'fetchPersonalCodes (undefined option)': {
      action: () => {
        return api.fetchPersonalCodes({
          discountId: undefined,
          promocode: '123'
        });
      },
      expected: {
        url: 'ENDPOINT/discount/undefined/personal_code/list?SESSID=SESSION&promocode=123',
        params: {method: 'GET'}
      }
    },
    'postPersonalCode (new)': {
      action: () => api.postPersonalCode('100000000000000001', null, { code: 'supercode' }),
      expected: {
        url: 'ENDPOINT/discount/100000000000000001/personal_code/new?SESSID=SESSION',
        params: {
          method: 'POST',
          body: {
            code: 'supercode'
          },
        }
      }
    },
    'postPersonalCode (existing ID)': {
      action: () => api.postPersonalCode('100000000000000001', '100000000000000002', { code: 'supercode' }),
      expected: {
        url: 'ENDPOINT/discount/100000000000000001/personal_code/100000000000000002?SESSID=SESSION',
        params: {
          method: 'POST',
          body: {
            code: 'supercode'
          },
        }
      }
    },
    'fetchUnapprovedSubscriptions (error)': {
      action: () => api.fetchUnapprovedSubscriptions({ search: null }),
      error: 'Failed to validate: search is invalid.'
    },
    'fetchUnapprovedSubscriptions (success)': {
      action: () => api.fetchUnapprovedSubscriptions({ search: '123', brAgentId: '100000000000000001' }),
      expected: {
        url: 'ENDPOINT/subscription_unapproved/list?SESSID=SESSION&search=123&br_agent_id=100000000000000001',
        params: {method: 'GET'}
      }
    },
    'listSoftGroups': {
      action: () => api.listSoftGroups(),
      expected: {
        url: 'ENDPOINT/api/soft_group/list?SESSID=SESSION',
        params: {method: 'GET'}
      }
    },
    'listDevelopers': {
      action: () => api.listDevelopers(),
      expected: {
        url: 'ENDPOINT/api/developer/list?SESSID=SESSION',
        params: {method: 'GET'}
      }
    },
    'listBrSoftsByDeveloperId': {
      action: () => api.listBrSoftsByDeveloperId('200000000000000000'),
      expected: {
        url: 'ENDPOINT/api/br_soft/list_by_developer_id/200000000000000000?SESSID=SESSION',
        params: {method: 'GET'}
      }
    },
    'listSoftsByBrSoftId': {
      action: () => api.listSoftsByBrSoftId('200000000000000001'),
      expected: {
        url: 'ENDPOINT/api/soft/list_by_br_soft_id/200000000000000001?SESSID=SESSION',
        params: {method: 'GET'}
      }
    },
    'listServicesBySoftId': {
      action: () => api.listServicesBySoftId('200000000000000002'),
      expected: {
        url: 'ENDPOINT/api/service/list_by_soft_id/200000000000000002?SESSID=SESSION',
        params: {method: 'GET'}
      }
    },
    'listServicesBySoftDiscountScopeObjId': {
      action: () => api.listServicesBySoftIdDiscountScopeObjId('200000000000000002', '200000000000000003'),
      expected: {
        url: 'ENDPOINT/api/service/list_by_soft_id_scope_obj_id/200000000000000002/200000000000000003?SESSID=SESSION',
        params: {method: 'GET'}
      }
    },
    'listBrAgents': {
      action: () => api.listTenantBrAgents(),
      expected: {
        url: 'ENDPOINT/api/br_agent/list_tenant?SESSID=SESSION',
        params: {method: 'GET'}
      }
    },
    'listSubscriptionsByBrAgentIdUuidForDiscount': {
      action: () => api.listSubscriptionsByBrAgentIdUuidForDiscount('200000000000000003', '200000000000000004'),
      expected: {
        url: 'ENDPOINT/api/subscription/list_by_br_agent_id_uuid_for_discount/200000000000000003/200000000000000004?SESSID=SESSION',
        params: {method: 'GET'}
      }
    },
    'listBrSoftComponentsApplicableForDiscountTarget': {
      action: () => api.listBrSoftComponentsApplicableForDiscountTarget('200000000000000005'),
      expected: {
        url: 'ENDPOINT/api/br_soft_component/list_applicable_for_discount_target/200000000000000005?SESSID=SESSION',
        params: {method: 'GET'}
      }
    },
    'xhrQuery (GET with url params)': {
      action: () => api.xhrQuery(
        'some/url/path',
        {method: 'GET'},
        {param1: '123$%,&?', param2: '321&&??/\\'}
        ),
      expected: {
        url: 'ENDPOINT/some/url/path?SESSID=SESSION&param1=123%24%25%2C%26%3F&param2=321%26%26%3F%3F%2F%5C',
        params: {method: 'GET'}
      }
    },
    'xhrQuery (POST with url params and body params)': {
      action: () => api.xhrQuery(
        'some/url/path',
        {method: 'POST', body: {param1: '123$%,&?', param2: '321&&??/\\'}},
        {param3: '321'}
      ),
      expected: {
        url: 'ENDPOINT/some/url/path?SESSID=SESSION&param3=321',
        params: {
          method: 'POST',
          body: 'param1=123%24%25%2C%26%3F&param2=321%26%26%3F%3F%2F%5C',
          headers: {
            'Content-type': 'application/x-www-form-urlencoded'
          }
        }
      }
    },
    'xhrQuery (GET with http link and url params)': {
      action: () => api.xhrQuery(
        'https://somedomain.com/some/url/path',
        {method: 'GET'},
        {param1: '321'}
      ),
      expected: {
        url: 'https://somedomain.com/some/url/path?SESSID=SESSION&param1=321',
        params: {
          method: 'GET',
        }
      }
    },
    'fetchExistingSubscriptionDiscountInfo (success)': {
      action: () => api.fetchExistingSubscriptionDiscountInfo(
        '111',
        {somefield: 'somevalue'},
        [{
          value: 0.5,
          is_percent: true,
          charge_rule: 'every_nth',
          charge_number: 2
        }],
        [1,2,3]
      ),
      expected: {
        url: 'ENDPOINT/api/discount/existing_subscription/info?SESSID=SESSION',
        params: {
          method: 'POST',
          headers: {'Content-type': 'application/json'},
          body: JSON.stringify({
            subscriptionId: '111',
            discount: {somefield: 'somevalue'},
            discountCharges: [{
              value: 0.5,
              is_percent: true,
              charge_rule: 'every_nth',
              charge_number: 2
            }],
            chargeNums: [1,2,3]
          })
        }
      }
    },
    'fetchNewSubscriptionDiscountInfo (success)': {
      action: () => api.fetchNewSubscriptionDiscountInfo(
        '111',
        '222',
        {somefield: 'somevalue'},
        [{
          value: 0.5,
          is_percent: true,
          charge_rule: 'every_nth',
          charge_number: 2
        }],
        [1,2,3]
      ),
      expected: {
        url: 'ENDPOINT/api/discount/new_subscription/info?SESSID=SESSION',
        params: {
          method: 'POST',
          headers: {'Content-type': 'application/json'},
          body: JSON.stringify({
            serviceId: '111',
            brAgentUserId: '222',
            discount: {somefield: 'somevalue'},
            discountCharges: [{
              value: 0.5,
              is_percent: true,
              charge_rule: 'every_nth',
              charge_number: 2
            }],
            chargeNums: [1,2,3]
          })
        }
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
