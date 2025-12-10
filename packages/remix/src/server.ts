import { createCookieSessionStorage } from '@remix-run/node';

const THEME_SESSION_KEY = 'tokiforge-theme';

export function createThemeSessionStorage(secret: string) {
    const sessionStorage = createCookieSessionStorage({
        cookie: {
            name: '__tokiforge_theme',
            secret,
            sameSite: 'lax',
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
        },
    });

    return {
        getTheme: async (request: Request): Promise<string | null> => {
            const session = await sessionStorage.getSession(request.headers.get('Cookie'));
            return session.get(THEME_SESSION_KEY) || null;
        },

        setTheme: async (request: Request, theme: string): Promise<string> => {
            const session = await sessionStorage.getSession(request.headers.get('Cookie'));
            session.set(THEME_SESSION_KEY, theme);
            return await sessionStorage.commitSession(session);
        },
    };
}
