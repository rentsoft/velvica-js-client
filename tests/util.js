import FormData from 'formdata-node';

export const createFetcherStub = () => {
  return {
    async fetch(url, params) {
      if (params.body instanceof FormData) {
        // Easier testing.
        params.body = Object.fromEntries(params.body);
      }

      this.result = {
        url,
        params
      };
    }
  };
};
