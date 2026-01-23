import type { ActionFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { SSRUtils } from '@tokiforge/core';

/**
 * Action route for setting theme cookie.
 * Called when user switches themes.
 */
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const theme = formData.get('theme') as string;

  if (!theme) {
    return json({ error: 'Theme is required' }, { status: 400 });
  }

  // Generate Set-Cookie header
  const cookie = SSRUtils.generateThemeCookie(theme, 'tokiforge-theme');

  return json(
    { success: true, theme },
    {
      headers: {
        'Set-Cookie': cookie,
      },
    }
  );
}
