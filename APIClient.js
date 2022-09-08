import axios from 'axios';

class APIClient {
  #instance;

  static get(...args) {
    return new APIClient().get(...args);
  }

  constructor(baseURL) {
    this.#instance = axios.create({
      baseURL,
      headers: { 'Content-Type': 'application/json' },
    });

    this.#instance.interceptors.response.use(({ data }) => data);
  }

  get(...args) {
    return this.#instance.get(...args);
  }

  post(...args) {
    return this.#instance.post(...args);
  }
}

export default APIClient;
