import '@testing-library/jest-dom';
import { server } from './server';

// Polyfill ResizeObserver for Recharts ResponsiveContainer in JSDOM
if (typeof (globalThis as any).ResizeObserver === 'undefined') {
  class ResizeObserverMock {
    callback: ResizeObserverCallback;
    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
    }
    observe() {/* no-op */}
    unobserve() {/* no-op */}
    disconnect() {/* no-op */}
  }
  // @ts-expect-error - injecting into global for test env
  (globalThis as any).ResizeObserver = ResizeObserverMock;
}

// Mock navigation API to suppress JSDOM warnings
if (typeof (globalThis as any).navigate === 'undefined') {
  // @ts-expect-error - injecting into global for test env
  (globalThis as any).navigate = () => {
    // Mock implementation - no-op
  };
}

// Establish API mocking before all tests.
beforeAll(() => server.listen());

// Reset any request handlers that are declared as a part of our tests (i.e. for testing one-time error scenarios)
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished.
afterAll(() => server.close()); 