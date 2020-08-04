import {describe, it, before, setup} from "mocha";
import {expect} from 'chai';
import ControlPanelApi, {VPSLogFilter, VPSStateChange} from "../src/ControlPanelApi";
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
    'rebuild with imageUUID and sshKey': {
      action: () => api.rebuild({imageUUID: 'foo', sshKey: 'bar'}),
      expected: {
        url: '[E]/subscription/[S]/rebuild?[A]',
        params: {
          method: 'POST',
          body: {image_uuid: 'foo', ssh_key: 'bar'}
        }
      }
    },
    'changeState with unknown state change': {
      action: () => api.changeState('UNKNOWN'),
      error: 'Action change UNKNOWN is not allowed!'
    },
    'changeState with known state change': {
      action: () => api.changeState(VPSStateChange.TURN_ON),
      expected: {
        url: '[E]/subscription/[S]/turnOn?[A]',
        params: {method: 'POST'}
      }
    },
    'startRescue': {
      action: () => api.startRescue('abc'),
      expected: {
        url: '[E]/subscription/[S]/rescue/start?image_id=abc&[A]',
        params: {method: 'POST'}
      }
    },
    'leaveRescue': {
      action: () => api.leaveRescue(),
      expected: {
        url: '[E]/subscription/[S]/rescue/leave?[A]',
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
