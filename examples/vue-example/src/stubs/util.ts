// Stub for Node.js 'util' module for browser compatibility
export function promisify(fn: Function) {
  return function promisified(...args: any[]) {
    return new Promise((resolve, reject) => {
      fn(...args, (err: Error | null, ...results: any[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(results.length === 1 ? results[0] : results);
        }
      });
    });
  };
}

export default {
  promisify,
};

