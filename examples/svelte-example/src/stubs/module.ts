export function createRequire(_from: string = '/') {
  return function require(id: string) {
    if (id === 'worker_threads') {
      return { Worker: undefined };
    }
    return {};
  };
}

export default {
  createRequire,
};

