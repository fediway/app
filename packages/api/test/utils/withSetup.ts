import { createApp } from 'vue';

/**
 * Run a composable inside a minimal Vue app so reactive APIs
 * (provide/inject, lifecycle hooks, etc.) work correctly in tests.
 */
export function withSetup<T>(composable: () => T): [T, ReturnType<typeof createApp>] {
  let result!: T;
  const app = createApp({
    setup() {
      result = composable();
      return () => {};
    },
  });
  app.mount(document.createElement('div'));
  return [result, app];
}
