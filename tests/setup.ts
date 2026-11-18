import { beforeEach, vi } from 'vitest';

// Se define un secreto determinístico para que los tests de JWT sean reproducibles.
beforeEach(() => {
  process.env.JWT_SECRET = 'test-secret';
  vi.restoreAllMocks();
});
