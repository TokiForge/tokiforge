export function createRequire(from = '/') {
  return function require(id) {
    if (id === 'worker_threads') {
      return { Worker: undefined };
    }
    return {};
  };
}

export default {
  createRequire,
};

