import defaults from './defaults.js';
import Client from './Client.js';

class TelegramS3BasedAPIGateway {
  #client;

  constructor(params = {}) {
    const {
      botToken,
      botTestMode,
      channelId,
      clientId,
      logger,
      serverPublicKeyJWK,
      serverVerificationKeyJWK,
    } = { ...defaults, ...params };

    this.#client = new Client({
      botToken,
      botTestMode,
      channelId,
      clientId,
      logger,
      serverPublicKeyJWK,
      serverVerificationKeyJWK,
    });

    this.#client.run();
  }

  delete(endpoint, params = {}, headers = {}) {
    return this.#client.request('delete', endpoint, params, headers);
  }

  get(endpoint, params = {}, headers = {}) {
    return this.#client.request('get', endpoint, params, headers);
  }

  head(endpoint, params = {}, headers = {}) {
    return this.#client.request('head', endpoint, params, headers);
  }

  options(endpoint, params = {}, headers = {}) {
    return this.#client.request('options', endpoint, params, headers);
  }

  patch(endpoint, params = {}, headers = {}) {
    return this.#client.request('patch', endpoint, params, headers);
  }

  post(endpoint, params = {}, headers = {}) {
    return this.#client.request('post', endpoint, params, headers);
  }

  put(endpoint, params = {}, headers = {}) {
    return this.#client.request('put', endpoint, params, headers);
  }
}

export default TelegramS3BasedAPIGateway;
