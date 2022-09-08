import APIClient from './APIClient.js';

class TelegramBot {
  #apiClient;

  constructor(token, isTestMode) {
    this.#apiClient = new APIClient(
      `https://api.telegram.org/bot${token}${isTestMode ? '/test' : ''}`
    );
  }

  sendDocument(...args) {
    return this.#apiClient.post('sendDocument', ...args);
  }

  getUpdates(...args) {
    return this.#apiClient.get('getUpdates', ...args);
  }
}

export default TelegramBot;
