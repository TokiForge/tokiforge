export function readFileSync() {
  throw new Error('readFileSync is not available in browser environment');
}

export function writeFileSync() {
  throw new Error('writeFileSync is not available in browser environment');
}

export default {
  readFileSync,
  writeFileSync,
};

