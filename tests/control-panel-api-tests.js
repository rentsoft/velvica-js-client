import {describe, it, before} from "mocha";
import {expect} from 'chai';
import {ControlPanelApi, VPSLogFilter, VPSStateChange} from "../src";
import {createFetcherStub} from "./util";

const ENDPOINT = 'ENDPOINT';
const SUBSCRIPTION_ID = 'SUBSCRIPTION_ID';
const AG_SIGN = 'AG_SIGN';

describe('ControlPanelApi', function () {
  /** @var {ControlPanelApi} api */
  let api = null;

  const tests = {
    'fetchInfo': {
      action: () => api.fetchInfo(),
      expected: {
        url: '[E]/subscription/[S]/info?[A]',
        params: {method: 'GET'}
      }
    },
    'fetchImages': {
      action: () => api.fetchImages(),
      expected: {
        url: '[E]/subscription/[S]/image?[A]',
        params: {method: 'GET'}
      }
    },
    'rebuild without parameters': {
      action: () => api.rebuild({}),
      error: 'Cannot rebuild without imageUUID specified.'
    },
    'rebuild with imageUUID': {
      action: () => api.rebuild({imageUUID: 'foo'}),
      expected: {
        url: '[E]/subscription/[S]/rebuild?[A]',
        params: {
          method: 'POST',
          body: {image_uuid: 'foo'}
        }
      }
    },
    'rebuild with imageUUID and sshKeyIds': {
      action: () => api.rebuild({imageUUID: 'foo', sshKeyIds: ['123', '456']}),
      expected: {
        url: '[E]/subscription/[S]/rebuild?[A]',
        params: {
          method: 'POST',
          body: {
            image_uuid: 'foo',
            ssh_keys: '123,456'
          }
        }
      }
    },
    'rebuild with imageUUID and new SSH key': {
      action: () => api.rebuild({imageUUID: 'foo', newSshKey: {name: 'name', value: 'value'}}),
      expected: {
        url: '[E]/subscription/[S]/rebuild?[A]',
        params: {
          method: 'POST',
          body: {
            image_uuid: 'foo',
            new_ssh_key_name: 'name',
            new_ssh_key_value: 'value'
          }
        }
      }
    },
    'rebuild with imageUUID and password-specific stuff': {
      action: () => api.rebuild({imageUUID: 'foo', password: 'pswd', allowPasswordLogin: false}),
      expected: {
        url: '[E]/subscription/[S]/rebuild?[A]',
        params: {
          method: 'POST',
          body: {
            image_uuid: 'foo',
            password: 'pswd',
            allow_password_login: 'false'
          }
        }
      }
    },
    'changeState with unknown state change': {
      action: () => api.changeState('UNKNOWN'),
      error: 'Action change UNKNOWN is not allowed!'
    },
    'changeState with known mapped state change': {
      action: () => api.changeState(VPSStateChange.TURN_ON),
      expected: {
        url: '[E]/subscription/[S]/start?[A]',
        params: {method: 'POST'}
      }
    },
    'fetchConsoleUrl': {
      action: () => api.fetchConsoleUrl(),
      expected: {
        url: '[E]/subscription/[S]/console/url?[A]',
        params: {method: 'GET'}
      }
    },
    'fetchLogs with incorrect logs count': {
      action: () => api.fetchLogs('100500'),
      error: 'Log count 100500 is not allowed!'
    },
    'fetchLogs with correct logs count': {
      action: () => api.fetchLogs(VPSLogFilter.COUNT_ALL),
      expected: {
        url: '[E]/subscription/[S]/console/logs/all?[A]',
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

      api = new ControlPanelApi({
        endpoint: ENDPOINT,
        subscriptionId: SUBSCRIPTION_ID,
        agSign: AG_SIGN
      }, fetcher);

      if (error) {
        action().catch(err => expect(err.message).to.equal(error));
      } else {
        await action();
        expect(fetcher.result).deep.equal({
          url: expected.url
            .replace('[E]', ENDPOINT)
            .replace('[S]', SUBSCRIPTION_ID)
            .replace('[A]', AG_SIGN),
          params: expected.params
        });
      }
    });
  });
});
