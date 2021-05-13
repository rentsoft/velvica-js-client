import {describe, it, before} from "mocha";
import {expect} from 'chai';
import {createFetcherStub, launchTests} from "./util";
import {PartnerApi} from "../src";
const ENDPOINT = 'ENDPOINT';
const BR_AGENT_USER_ID = 'BR_AGENT_USER_ID';
const BR_AGENT_ID = 'BR_AGENT_ID';
const AG_SIGN = 'AG_SIGN';

describe('PartnerApi', function () {
  const tests = {
    'fetchSubscriptions': {
      action: (api) => api.fetchSubscriptions(),
      expected: {
        url: '[E]/users/[BU]/subscriptions?sales_channel_id=[BA]&[A]',
        params: {method: 'GET'}
      }
    },
    'fetchOnlyVps': {
      action: (api) => api.fetchSubscriptions({'product_type': 'vps'}),
      expected: {
        url: '[E]/users/[BU]/subscriptions?sales_channel_id=[BA]&[A]&product_type=vps',
        params: {method: 'GET'}
      }
    },
    'fetchSshKeys': {
      action: (api) => api.fetchSshKeys(),
      expected: {
        url: '[E]/users/[BU]/ssh_keys?sales_channel_id=[BA]&[A]',
        params: {method: 'GET'}
      }
    },
    'createSshKey': {
      action: (api) => api.createSshKey('name', 'key'),
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
      action: (api) => api.updateSshKey('12345', 'new name'),
      expected: {
        url: '[E]/users/[BU]/ssh_keys/12345?sales_channel_id=[BA]&[A]',
        params: {
          method: 'PUT',
          body: "{\"name\":\"new name\"}"
        }
      }
    },
    'deleteSshKey': {
      action: (api) => api.deleteSshKey('67890'),
      expected: {
        url: '[E]/users/[BU]/ssh_keys/67890?sales_channel_id=[BA]&[A]',
        params: {method: 'DELETE'}
      }
    },
    'fetchVendorLogs': {
      action: (api) => api.fetchVendorLogs('12345'),
      expected: {
        url: '[E]/users/[BU]/subscriptions/12345/vendor_logs?sales_channel_id=[BA]&[A]',
        params: {method: 'GET'}
      }
    },
    'fetchBillingLogs': {
      action: (api) => api.fetchBillingLogs('67890'),
      expected: {
        url: '[E]/users/[BU]/subscriptions/67890/billing_logs?sales_channel_id=[BA]&[A]',
        params: {method: 'GET'}
      }
    },
  };

  launchTests(
    (fetcher) => {
      return new PartnerApi(
        {
          endpoint: ENDPOINT,
          brAgentUserUuid: BR_AGENT_USER_ID,
          brAgentId: BR_AGENT_ID,
          agSign: AG_SIGN
        },
        fetcher
      );
    },
    {
      '[E]': ENDPOINT,
      '[BU]': BR_AGENT_USER_ID,
      '[BA]': BR_AGENT_ID,
      '[A]': AG_SIGN,
    },
    tests
  );
});
