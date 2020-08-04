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

const CONNECTION_FAILURE_ROUTE = '/disconnect';
const CONNECTION_FAILURE_ERROR = 'Oh noes!';

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

      fetchMock.get(
        CONNECTION_FAILURE_ROUTE,
        {
          throws: CONNECTION_FAILURE_ERROR
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

      fetcher.setConnectionFailedHandler(
        (error) => {
          throw new Error(`Handled: ${error}`);
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
      // It was previously set up above to throw exceptions like that.
      expect(err.code).to.equal(ERROR_CODE);
      expect(err.name).to.equal(ERROR_NAME);
      expect(err.message).to.equal(ERROR_DETAIL);
    });
  });

  it('should handle connection failures', function () {
    fetcher.fetch(CONNECTION_FAILURE_ROUTE).catch(err => {
      // "Handled: " is added above. Just for test reasons.
      expect(err.message).to.equal(`Handled: ${CONNECTION_FAILURE_ERROR}`);
    });
  });

  after(() => fetchMock.restore());
});
