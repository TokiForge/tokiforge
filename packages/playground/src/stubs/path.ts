export const extname = () => {
  throw new Error('path.extname is not available in browser');
};

export const join = () => {
  throw new Error('path.join is not available in browser');
};

export const resolve = () => {
  throw new Error('path.resolve is not available in browser');
};

export default {
  extname,
  join,
  resolve,
};

