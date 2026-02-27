/**
 * Jest test setup file
 * Runs before all tests
 */

// Suppress console output during tests (optional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };

// Set test timeout
jest.setTimeout(10000);

// Global test utilities
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
