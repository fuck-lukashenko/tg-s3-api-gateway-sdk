import { isUndefinedType } from './utils.js';

let NativeSubtleCrypto;

if (!isUndefinedType(typeof window)) {
  NativeSubtleCrypto = window.crypto.subtle;
}

export default NativeSubtleCrypto;
