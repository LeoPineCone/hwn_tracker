import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // CDK's NodejsFunction bundling spawns esbuild as a child process, which
    // conflicts with vitest's default worker_threads pool. Forks avoid that.
    pool: 'forks',
  },
});
