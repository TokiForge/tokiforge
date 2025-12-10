import { cookies } from 'next/headers';

export async function getServerTheme(cookieName: string = 'tokiforge-theme'): Promise<string | undefined> {
    const cookieStore = await cookies();
    return cookieStore.get(cookieName)?.value;
}

export async function setServerTheme(theme: string, cookieName: string = 'tokiforge-theme'): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(cookieName, theme, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365, // 1 year
        sameSite: 'lax',
    });
}
