// Stub for Node.js 'fs/promises' module for browser compatibility
export const readFile = () => Promise.reject(new Error('fs/promises.readFile is not available in the browser.'));
export const writeFile = () => Promise.reject(new Error('fs/promises.writeFile is not available in the browser.'));
export default {};

