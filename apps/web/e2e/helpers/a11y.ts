import type { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { expect } from '@playwright/test';

/**
 * Run WCAG 2.1 AA accessibility scan on the current page.
 * Call at the end of every E2E test for free a11y regression coverage.
 */
export async function expectAccessible(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();

  expect(
    results.violations,
    `Accessibility violations found:\n${results.violations.map(v => `  - ${v.id}: ${v.description} (${v.nodes.length} instances)`).join('\n')}`,
  ).toEqual([]);
}
