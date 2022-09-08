import { isUndefinedType } from './utils.js';

let NativeCrypto;

if (!isUndefinedType(typeof window)) {
  NativeCrypto = window.crypto;
}

export default NativeCrypto;
