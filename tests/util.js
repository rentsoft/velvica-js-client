import FormData from 'formdata-node';
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
