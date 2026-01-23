'use server';

import { cookies } from 'next/headers';

/**
 * Server action to set the theme cookie.
 * This ensures the theme persists across page reloads.
 */
export async function setThemeAction(theme: string) {
  cookies().set('tokiforge-theme', theme, {
    path: '/',
    maxAge: 31536000, // 1 year
    sameSite: 'lax',
  });
  
  return { success: true };
}
