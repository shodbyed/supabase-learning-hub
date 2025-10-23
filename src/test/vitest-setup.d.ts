/**
 * @fileoverview Type declarations for Vitest with jest-dom matchers
 * Extends Vitest's Assertion interface to include jest-dom matchers
 */
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';
import 'vitest';

declare module 'vitest' {
  interface Assertion<T = any> extends TestingLibraryMatchers<T, void> {}
  interface AsymmetricMatchersContaining extends TestingLibraryMatchers {}
}
