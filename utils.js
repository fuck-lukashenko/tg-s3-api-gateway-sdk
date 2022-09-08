export const encode = (string) => (
  btoa(unescape(encodeURIComponent(string)))
);

export const decode = (string) => (
  decodeURIComponent(escape(atob(string)))
);

export const binaryStringToBuffer = (string) => (
  Uint8Array.from(string, c => c.charCodeAt(0))
);

export const stringToBuffer = (string) => (
  new TextEncoder().encode(string)
);

export const stringFromBuffer = (buffer) => (
  String.fromCharCode(...new Uint8Array(buffer))
);

export const stringToChunks = (string) => (
  string.match(/.{1,350}/g)
);

export const stringFromChunks = (string) => (
  string.join('')
);

export const sleep = (ms) => (
  new Promise(r => setTimeout(r, ms))
);

export const isUndefinedType = (typeString) => (
  typeString === typeof undefined
);
