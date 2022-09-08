# Telegram / Amazon S3 based API Gateway SDK for JavaScript

The SDK for the API Gateway that hides data under HTTPS interactions with widely used services and their domain names: AWS S3 and Telegram API, so for internet providers everything would look like a regular usage of those services.

## Concept

The protocol assumes the following interaction:
- There is a Telegram channel that is used to exchange messages. Both the "client" and the "server" bots are connected to that channel. The client bot is used to send requests from the client app, and the server bot is used to respond to those requests.
- The client uses the `server-public-key` to encrypt the data and then sends the encrypted request file message to the Telegram channel using the `client-bot-token`. The encrypted part of the message contains the request info `{ method, path, headers, params }` and the client info `{ id, publicKey }`.
- The server decrypts the message and makes a request. Then the response is encrypted by client\`s `publicKey` and signed. The server uploads the response to AWS S3 and posts the `response-download-url` (also encrypted and signed) to the channel.
- The client sees the channel updates, it sees the `response-download-url` message, it decrypts the message using `client-secret-key` and verifies that it came from the server. Then the client downloads the response from AWS S3, then decrypts and verifies it.

## Demo

There is a [demo app](https://s3.amazonaws.com/web.app/index.html), the source is [here](https://github.com/fuck-lukashenko/web-app).

## Usage

It's expected that you have a `clientId`. If don't, please contact the server maintainer to obtain your `clientId`. On the server, each `clientId` is restricted to be used for API calls with some base URL associated with it.

### Install the `tg-s3-api-gateway-sdk` package:

For npm:
```
npm install fuck-lukashenko/tg-s3-api-gateway-sdk
```

For yarn:
```
yarn add fuck-lukashenko/tg-s3-api-gateway-sdk
```

### Initialize the client:
```js
import TelegramS3BasedAPIGateway from 'tg-s3-api-gateway-sdk';

const client = new TelegramS3BasedAPIGateway({
  clientId: 'your-client-id-here',
});
```

### Make API calls:
```js
  // GET request
  client.get(endpoint, params, headers);
```
```js
  // POST request
  client.post(endpoint, params, headers);
```
```js
  // PATCH request
  client.patch(endpoint, params, headers);
```
```js
  // PUT request
  client.put(endpoint, params, headers);
```
```js
  // DELETE request
  client.delete(endpoint, params, headers);
```
```js
  // HEAD request
  client.head(endpoint, params, headers);
```
```js
  // OPTIONS request
  client.options(endpoint, params, headers);
```

## Advanced usage

```js
import TelegramS3BasedAPIGateway from 'tg-s3-api-gateway-sdk';

const client = new TelegramS3BasedAPIGateway({
  clientId: 'your-client-id-here',
  botToken: 'your-telegram-bot-token',
  botTestMode: false,
  channelId: 'The id or @username of Telegram channel',
  logger: console, // Optional. By default, there is a silent mode.
  serverPublicKeyJWK: { /* The server public RSA key JWK data */ },
  serverVerificationKeyJWK: { /* The server verification ECDSA key JWK data */ },
});
```

At the example above, the `botToken` is your 'client' telegram bot token, the `botTestMode` specifies if the bot uses test Telegram API instead of the live version, and the `channelId` allows you to specify the channel to send messages to. You must ensure that the 'server' bot is also connected to the channel the 'client' bot sends messages to. You must ensure that the 'client' and the 'server' bot both are using the same Telegram mode (either both live or both test).

If you launch your own server instance, you can specify your server\`s `serverPublicKeyJWK` (RSA-OAEP SHA-256) and `serverVerificationKeyJWK` (ECDSA P-256).
