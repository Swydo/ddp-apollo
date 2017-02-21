import { DEFAULT_METHOD } from './common';

class DDPNetworkInterface {
  constructor({
        connection,
        noRetry = true,
        method = DEFAULT_METHOD } = {},
    ) {
    this.connection = connection;
    this.noRetry = noRetry;
    this.method = method;
  }

  query(request = {}) {
    return new Promise((resolve) => {
      this.connection.apply(this.method, [request], { noRetry: this.noRetry }, (error, data) => {
        if (error) {
          resolve({ errors: [error] });
        } else {
          resolve(data);
        }
      });
    });
  }
}

export { DDPNetworkInterface };
