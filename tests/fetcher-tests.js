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
          body: SUCCESS_BODY
        },
        {
          headers: { Accept: 'application/json' }
        }
      );

      fetchMock.get(
        ERROR_ROUTE,
        {
          status: ERROR_CODE,
          body: {error: ERROR_NAME, detail: ERROR_DETAIL},
        },
        {
          headers: { Accept: 'application/json' }
        }
      );

      fetchMock.get(
        CONNECTION_FAILURE_ROUTE,
        {
          throws: CONNECTION_FAILURE_ERROR
        },
        {
          headers: { Accept: 'application/json' }
        }
      );

      fetcher = new Fetcher();

      fetcher.setErrorHandler(
        (response, {error, detail}) => {
          const errorInstance = new Error(`${response.status}: ${error}`);
          errorInstance.detail = detail;
          throw errorInstance;
        }
      );

      fetcher.setConnectionFailedHandler(
        (error) => {
          throw new Error(`Connection error: ${error}`);
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

  it('should handle erroneous responses', function (done) {
    fetcher.fetch(ERROR_ROUTE).catch(err => {
      // It was previously set up above to throw exceptions like that.
      expect(err.message).to.equal(`${ERROR_CODE}: ${ERROR_NAME}`);
      expect(err.detail).to.equal(ERROR_DETAIL);
      done();
    });
  });

  it('should handle connection failures', function (done) {
    fetcher.fetch(CONNECTION_FAILURE_ROUTE).catch(err => {
      // "Handled: " is added above. Just for test reasons.
      expect(err.message).to.equal(`Connection error: ${CONNECTION_FAILURE_ERROR}`);
      done();
    });
  });

  after(() => fetchMock.restore());
});
