import {describe, it, before} from "mocha";
import {expect} from 'chai';
import {createFetcherStub} from "./util";
import {PartnerApi} from "../src/PartnerApi";

const ENDPOINT = 'ENDPOINT';
const BR_AGENT_USER_ID = 'BR_AGENT_USER_ID';
const BR_AGENT_ID = 'BR_AGENT_ID';
const AG_SIGN = 'AG_SIGN';

describe('PartnerApi', function () {
  /** @var {PartnerApi} api */
  let api = null;

  const tests = {
    'fetchSubscriptions': {
      action: () => api.fetchSubscriptions(),
      expected: {
        url: '[E]/users/[BU]/subscriptions?sales_channel_id=[BA]&[A]',
        params: {method: 'GET'}
      }
    },
    'fetchOnlyVps': {
      action: () => api.fetchSubscriptions({'product_type': 'vps'}),
      expected: {
        url: '[E]/users/[BU]/subscriptions?sales_channel_id=[BA]&product_type=vps&[A]',
        params: {method: 'GET'}
      }
    },
    'fetchSshKeys': {
      action: () => api.fetchSshKeys(),
      expected: {
        url: '[E]/users/[BU]/ssh_keys?sales_channel_id=[BA]&[A]',
        params: {method: 'GET'}
      }
    },
    'createSshKey': {
      action: () => api.createSshKey('name', 'key'),
      expected: {
        url: '[E]/users/[BU]/ssh_keys?sales_channel_id=[BA]&[A]',
        params: {
          method: 'POST',
          body: {
            name: 'name',
            public_key: 'key',
          }
        }
      }
    },
    'updateSshKey': {
      action: () => api.updateSshKey('12345', 'new name'),
      expected: {
        url: '[E]/users/[BU]/ssh_keys/12345?sales_channel_id=[BA]&[A]',
        params: {
          method: 'PUT',
          body: "{\"name\":\"new name\"}"
        }
      }
    },
    'deleteSshKey': {
      action: () => api.deleteSshKey('67890'),
      expected: {
        url: '[E]/users/[BU]/ssh_keys/67890?sales_channel_id=[BA]&[A]',
        params: {method: 'DELETE'}
      }
    },
    'fetchVendorLogs': {
      action: () => api.fetchVendorLogs('12345'),
      expected: {
        url: '[E]/users/[BU]/subscriptions/12345/vendor_logs?sales_channel_id=[BA]&[A]',
        params: {method: 'GET'}
      }
    },
    'fetchBillingLogs': {
      action: () => api.fetchBillingLogs('67890'),
      expected: {
        url: '[E]/users/[BU]/subscriptions/67890/billing_logs?sales_channel_id=[BA]&[A]',
        params: {method: 'GET'}
      }
    },
  };

  before(() => {
    process.env.NODE_ENV = 'production';
  });

  Object.entries(tests).forEach(([testName, {action, expected, error}]) => {
    it(testName, async () => {
      const fetcher = createFetcherStub();

      api = new PartnerApi({
        endpoint: ENDPOINT,
        brAgentUserUuid: BR_AGENT_USER_ID,
        brAgentId: BR_AGENT_ID,
        agSign: AG_SIGN
      }, fetcher);

      if (error) {
        action().catch(err => expect(err.message).to.equal(error));
      } else {
        await action();
        expect(fetcher.result).deep.equal({
          url: expected.url
            .replace('[E]', ENDPOINT)
            .replace('[BU]', BR_AGENT_USER_ID)
            .replace('[BA]', BR_AGENT_ID)
            .replace('[A]', AG_SIGN),
          params: expected.params
        });
      }
    });
  });
});
