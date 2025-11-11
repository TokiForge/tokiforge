/**
 * Test setup file for Vitest
 * This file runs before each test file to set up the test environment
 */

import { vi } from 'vitest';

// Ensure localStorage is properly mocked
if (typeof window !== 'undefined') {
  const storage: Record<string, string> = {};
  
  // Always replace localStorage to ensure it has all methods
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: (key: string) => storage[key] || null,
      setItem: (key: string, value: string) => {
        storage[key] = value;
      },
      removeItem: (key: string) => {
        delete storage[key];
      },
      clear: () => {
        Object.keys(storage).forEach(key => delete storage[key]);
      },
      get length() {
        return Object.keys(storage).length;
      },
      key: (index: number) => {
        const keys = Object.keys(storage);
        return keys[index] || null;
      },
    },
    writable: true,
    configurable: true,
  });
}

// Mock matchMedia if not available
if (typeof window !== 'undefined' && !window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

