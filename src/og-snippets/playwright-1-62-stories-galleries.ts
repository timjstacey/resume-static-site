// Playwright 1.62: mount() drives a gallery page you serve, not a bundled component.
import type { Locator } from '@playwright/test';

// mount renders one story by id, returning a Locator scoped to its root element.
type Component = Locator & { update(props: object): Promise<void> };
declare const test: (name: string, body: (fx: { mount: (id: string) => Promise<Component> }) => Promise<void>) => void;
declare const expect: (target: Locator) => { toBeVisible(): Promise<void> };

test('expands on click', async ({ mount }) => {
  const component = await mount('Expandable/Collapsed');
  await component.getByRole('button', { name: 'Show more' }).click();
  await expect(component.getByTestId('body')).toBeVisible();
  await component.update({ open: true }); // re-render the story with new props
});
