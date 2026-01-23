// Optional: jest-dom matchers for enhanced assertions
// Note: jest-dom matchers may not be available in this version
// Using native DOM queries and standard vitest assertions instead

// Extend Vitest matchers if jest-dom is available
declare global {
  namespace Vi {
    interface Assertion<T = any> {
      toBeTruthy(): T;
      toBeFalsy(): T;
    }
  }
}
