// Stub for Node.js 'fs' module for browser compatibility
export const readFileSync = () => {
  throw new Error('fs.readFileSync is not available in the browser. Use ThemeRuntime instead.');
};
export const writeFileSync = () => {
  throw new Error('fs.writeFileSync is not available in the browser.');
};
export const existsSync = () => false;
export default {};

