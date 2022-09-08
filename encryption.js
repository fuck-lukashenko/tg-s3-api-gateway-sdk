import NativeSubtleCrypto from './NativeSubtleCrypto.js';
import {
  binaryStringToBuffer,
  decode,
  encode,
  stringFromBuffer,
  stringToBuffer,
  stringToChunks,
  stringFromChunks,
} from './utils.js';

const KEY_ALGORITHM = 'RSA-OAEP';
const KEY_FORMAT = 'jwk';
const KEY_HASH = 'SHA-256';
export const KEY_ALGORITHM_OPTIONS = {
  RSA: { name: 'RSA-OAEP', hash: 'SHA-256' },
  ECDSA: { name: 'ECDSA', namedCurve: 'P-256', hash: 'SHA-256' },
};

export const generateKeyPair = async () => {
  const keyPair = await NativeSubtleCrypto.generateKey(
    {
      name: KEY_ALGORITHM,
      modulusLength: 4096,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: KEY_HASH,
    },
    true,
    ['encrypt', 'decrypt']
  );

  return keyPair;
}

export const importKey = async (jwk, algorithmOptions, keyUsages) => {
  const key = await NativeSubtleCrypto.importKey(
    KEY_FORMAT,
    jwk,
    algorithmOptions,
    false,
    keyUsages
  );

  return key;
}

export const exportKey = async (key) => {
  const keyData = await NativeSubtleCrypto.exportKey(KEY_FORMAT, key);

  return keyData;
}

export const verify = async (string, base64EncodedSignature, verificationKey) => {
  return await NativeSubtleCrypto.verify(
    KEY_ALGORITHM_OPTIONS.ECDSA,
    verificationKey,
    binaryStringToBuffer(decode(base64EncodedSignature)),
    stringToBuffer(string)
  );
}

export const encrypt = async (data, encryptionKey) => {
  const json = JSON.stringify(data);
  const base64EncodedJson = encode(json);
  const chunks = stringToChunks(base64EncodedJson);
  const encryptedChunks = await Promise.all(
    chunks.map(async (c) => await encryptString(c, encryptionKey))
  );

  return encryptedChunks;
}

const encryptString = async (string, encryptionKey) => {
  const encryptedArrayBuffer = await NativeSubtleCrypto.encrypt(
    KEY_ALGORITHM,
    encryptionKey,
    stringToBuffer(string)
  );

  return encode(stringFromBuffer(encryptedArrayBuffer));
}

export const decrypt = async (encryptedChunks, decryptionKey) => {
  const decryptedCompressedString = stringFromChunks(
    await Promise.all(
      encryptedChunks.map(async (s) => await decryptString(s, decryptionKey))
    )
  );
  const jsonString = decode(decryptedCompressedString);

  return JSON.parse(jsonString);
}

const decryptString = async (encryptedString, decryptionKey) => {
  const decryptedArrayBuffer = await NativeSubtleCrypto.decrypt(
    KEY_ALGORITHM,
    decryptionKey,
    binaryStringToBuffer(decode(encryptedString))
  );

  return stringFromBuffer(decryptedArrayBuffer);
}
