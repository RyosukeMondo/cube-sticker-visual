import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/test/build-verification.test.ts', 'src/test/algorithm-data-verification.test.ts']
  }
})