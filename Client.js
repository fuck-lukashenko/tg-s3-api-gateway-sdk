import APIClient from './APIClient.js';
import NativeCrypto from './NativeCrypto.js';
import TelegramBot from './TelegramBot.js';
import {
  KEY_ALGORITHM_OPTIONS,
  decrypt,
  encrypt,
  exportKey,
  generateKeyPair,
  importKey,
  verify
} from './encryption.js';
import { sleep } from './utils.js';

class Client {
  #awaitingMessageIds;
  #telegramBot;
  #channelId;
  #clientId;
  #clientPublicKey;
  #clientPrivateKey;
  #logger;
  #serverPublicKey;
  #serverVerificationKey;
  #updates;

  constructor({
    botToken,
    botTestMode,
    channelId,
    clientId,
    logger,
    serverPublicKeyJWK,
    serverVerificationKeyJWK,
  }) {
    this.#logger = logger;
    this.#logger.info('Initializing the client...');

    this.#logger.info('Generating client key pair...');
    generateKeyPair().then((({ privateKey, publicKey }) => {
      this.#clientPublicKey = publicKey;
      this.#clientPrivateKey = privateKey;
      this.#logger.info('Generated client key pair.');
      this.#logger.debug({ privateKey, publicKey });
    }).bind(this));

    this.#logger.info('Importing server public key...');
    importKey(
      serverPublicKeyJWK,
      KEY_ALGORITHM_OPTIONS.RSA,
      ['encrypt']
    ).then(((serverPublicKey) => {
      this.#serverPublicKey = serverPublicKey;
      this.#logger.info('Imported server public key.');
      this.#logger.debug(serverPublicKey);
    }).bind(this));

    this.#logger.info('Importing server verification key...');
    importKey(
      serverVerificationKeyJWK,
      KEY_ALGORITHM_OPTIONS.ECDSA,
      ['verify']
    ).then(((serverVerificationKey) => {
      this.#serverVerificationKey = serverVerificationKey;
      this.#logger.info('Imported server verification key.');
      this.#logger.debug(serverVerificationKey);
    }).bind(this));

    this.#telegramBot = new TelegramBot(botToken, botTestMode);

    this.#channelId = channelId;
    this.#clientId = clientId;

    this.#awaitingMessageIds = [];
    this.#updates = [];
  }

  async run() {
    while (!this.#isInitializationComplete) {
      await sleep(10);
    }
    this.#logger.info('The client is now ready to process requests.');

    const pooler = async () => {
      if (!this.#awaitingMessageIds.length) {
        setTimeout(pooler, 10);

        return;
      }

      this.#logger.info('Pulling updates...');
      this.#updates = await this.#getUpdates();
      this.#logger.info('Pulled updates.');
      this.#logger.debug(this.#updates);
      setTimeout(pooler, 500);
    }

    pooler();
  }

  async request(method, endpoint, data, headers) {
    while (!this.#isInitializationComplete) {
      await sleep(10);
    }

    const startTime = new Date();
    const marker = `[${NativeCrypto.randomUUID()}]`;
    this.#logger.info(marker, 'Processing', method.toUpperCase(), endpoint);
    this.#logger.debug(marker, { method, endpoint, data, headers });

    this.#logger.info(marker, 'Exporting client public key...');
    const publicKey = await exportKey(this.#clientPublicKey);
    this.#logger.info(marker, 'Exported client public key.');
    this.#logger.debug(marker, publicKey);

    this.#logger.info(marker, 'Encrypting the request...');
    this.#logger.debug(marker, {
      client: {
        id: this.#clientId,
        publicKey,
      },
      request: {
        method,
        endpoint,
        headers,
        data
      },
    });
    const encrypted = await encrypt({
      client: {
        id: this.#clientId,
        publicKey,
      },
      request: {
        method,
        endpoint,
        headers,
        data
      },
    }, this.#serverPublicKey);
    this.#logger.info(marker, 'Encrypted the request.');
    this.#logger.debug(marker, encrypted);

    this.#logger.info(marker, 'Sending the encrypted request file to the Telegram channel...');
    const { result: { message_id: messageId } } = await this.#postData({ encrypted });
    this.#logger.info(marker, 'Sent the encrypted request file to the Telegram channel.');
    this.#logger.debug(marker, { result: { message_id: messageId } });

    this.#logger.info(marker, 'Waiting for a response...');
    const { response } = await this.#responseFor(messageId, marker);
    this.#logger.info(marker, 'The response is successfully received, verified and decrypted.');
    this.#logger.debug(marker, response);
    this.#logger.info(marker, 'Done in', (new Date() - startTime).toLocaleString(), 'ms.');

    return response;
  }

  get #isInitializationComplete() {
    return (
      !!this.#clientPublicKey
      && !!this.#clientPrivateKey
      && !!this.#serverPublicKey
      && !!this.#serverVerificationKey
    );
  }

  async #responseFor(messageId, marker) {
    this.#awaitingMessageIds.push(messageId);

    const encryptedLink = await this.#encryptedResponseFor(messageId, marker);

    this.#logger.info(marker, 'Decrypting the response download url...');
    const { responseUrl } = await decrypt(encryptedLink, this.#clientPrivateKey);
    this.#logger.info(marker, 'Decrypted the response download url. Downloading...');
    this.#logger.debug(marker, { responseUrl });
    const { encrypted, signature } = await APIClient.get(responseUrl);
    this.#logger.info(marker, 'Downloaded the response. Verifying...');
    this.#logger.debug(marker, { encrypted, signature });
    const isVerified = await verify(encrypted, signature, this.#serverVerificationKey);

    if (isVerified) {
      this.#logger.info(marker, 'The response is verified. Decrypting...');
      const result = await decrypt(encrypted, this.#clientPrivateKey);
      this.#logger.info(marker, 'Decrypted the response.');

      this.#awaitingMessageIds = this.#awaitingMessageIds.filter(i => i !== messageId);

      return result;
    }

    this.#logger.info(marker, 'The response is not verified.');
  }

  async #encryptedResponseFor(messageId, marker) {
    while (true) {
      for (let update of this.#updates) {
        const jsonString = update.channel_post?.text;
        const isReplyForMessageId = update.channel_post?.reply_to_message?.message_id === messageId;

        if (!jsonString || !isReplyForMessageId) {
          continue;
        }

        this.#logger.info(marker, 'Received a response candidate. Parsing...');
        const { encrypted, signature } = JSON.parse(jsonString);
        this.#logger.info(marker, 'The response candidate is parsed. Verifying...');
        this.#logger.debug(marker, { encrypted, signature });
        const isVerified = await verify(encrypted, signature, this.#serverVerificationKey);

        if (isVerified) {
          this.#logger.info(marker, 'The response candidate is verified.');

          return encrypted;
        }

        this.#logger.info(marker, 'The response candidate is not verified. Waiting...');
      }

      await sleep(10);
    }
  }

  #postData(data) {
    const formData = new FormData();
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    formData.append('document', blob, 'request.json');
    formData.append('chat_id', this.#channelId);

    return this.#telegramBot.sendDocument(formData);
  }

  async #getUpdates() {
    const rawUpdates = (await this.#getRawUpdates()).result;

    return rawUpdates;
  }

  #getRawUpdates() {
    return this.#telegramBot.getUpdates();
  }
}

export default Client;
