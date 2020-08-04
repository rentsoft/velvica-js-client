import {describe, it, before, after} from "mocha";
import chai, {expect} from 'chai';
import Fetcher from "../src/util/Fetcher";
import chaiFetchMock from 'chai-fetch-mock';
import fetchMock from 'fetch-mock';

chai.use(chaiFetchMock);

const SUCCESS_ROUTE = '/ok';
const SUCCESS_BODY = {foo: 'bar'};

const ERROR_ROUTE = '/error';
const ERROR_NAME = 'ERR_SALES_CHANNEL_FORBIDDEN';
const ERROR_DETAIL = 'Access denied to sales channel.';
const ERROR_CODE = 400;

describe('Fetcher', function () {
  let fetcher;

  before(
    () => {
      fetchMock.get(
        SUCCESS_ROUTE,
        {
          status: 200,
          body: SUCCESS_BODY,
        }
      );

      fetchMock.get(
        ERROR_ROUTE,
        {
          status: ERROR_CODE,
          body: {error: ERROR_NAME, detail: ERROR_DETAIL},
        }
      );

      fetcher = new Fetcher();

      fetcher.setErrorHandler(
        (statusCode, {error, detail}) => {
          const errorInstance = new Error(detail);
          errorInstance.code = statusCode;
          errorInstance.name = error;
          errorInstance.message = detail;
          throw errorInstance;
        }
      );
    }
  );

  it('should handle OK responses', function () {
    let hadError = null;

    fetcher.fetch(SUCCESS_ROUTE).then((result) => {
      hadError = false;
      expect(result).to.be.deep.equal(SUCCESS_BODY);
    }).catch(() => {
      hadError = true;
    });

    setTimeout(() => expect(hadError).to.be.false, 50);
  });

  it('should handle erroneous responses', function () {
    fetcher.fetch(ERROR_ROUTE).catch(err => {
      expect(err.code).to.equal(ERROR_CODE);
      expect(err.name).to.equal(ERROR_NAME);
      expect(err.message).to.equal(ERROR_DETAIL);
    });
  });

  after(() => fetchMock.restore());
});
