import FormData from 'formdata-node';
import {before, it} from "mocha";
import {BoApi} from "../src";
import {expect} from "chai";
global.FormData = FormData;

export const createFetcherStub = () => {
  return {
    async fetch(url, params) {
      if (params.body instanceof FormData) {
        // Easier testing.
        params.body = [...params.body].reduce((prevObject, [key, value]) => {
          prevObject[key] = value;
          return prevObject;
        }, {});
      }

      this.result = {
        url,
        params
      };
    }
  };
};

export const launchTests = (apiMaker, replacements, tests) => {
  let api = null;

  before(() => {
    process.env.NODE_ENV = 'production';
  });

  Object.entries(tests).forEach(([testName, {action, expected, error}]) => {
    it(testName, async () => {
      const fetcher = createFetcherStub();
      api = new apiMaker(fetcher);

      if (error) {
        action(api).catch(err => expect(err.message).to.equal(error));
      } else {
        await action(api);

        const replacedUrl = Object.entries(replacements).reduce(
          (url, [search, replacement]) => url.replace(search, replacement),
          expected.url
        );

        expect(fetcher.result).deep.equal({
          url: replacedUrl,
          params: expected.params
        });
      }
    });
  });
};
