// Stub for Node.js 'zlib' module for browser compatibility
export const brotliCompress = async () => {
  throw new Error('Brotli compression is not available in browser. Use Gzip compression instead.');
};

export const brotliDecompress = async () => {
  throw new Error('Brotli decompression is not available in browser. Use Gzip decompression instead.');
};

export const constants = {
  BROTLI_PARAM_QUALITY: 'BROTLI_PARAM_QUALITY',
};

export default {
  brotliCompress,
  brotliDecompress,
  constants,
};

