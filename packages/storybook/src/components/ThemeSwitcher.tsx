import React, { useState, useEffect } from 'react';

export function ThemeSwitcher() {
  const [themes, setThemes] = useState<string[]>([]);
  const [currentTheme, setCurrentTheme] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).__tokiforge) {
      const runtime = (window as any).__tokiforge;
      setThemes(runtime.getAvailableThemes());
      setCurrentTheme(runtime.getCurrentTheme() || '');
    }

    const handleThemeChange = (event: CustomEvent) => {
      setCurrentTheme(event.detail.theme);
    };

    window.addEventListener('tokiforge:theme-change', handleThemeChange as EventListener);

    return () => {
      window.removeEventListener('tokiforge:theme-change', handleThemeChange as EventListener);
    };
  }, []);

  const handleThemeChange = async (themeName: string) => {
    if (typeof window !== 'undefined' && (window as any).__tokiforge) {
      const runtime = (window as any).__tokiforge;
      await runtime.applyTheme(themeName);
      setCurrentTheme(themeName);
    }
  };

  if (themes.length === 0) {
    return null;
  }

  return (
    <select
      value={currentTheme}
      onChange={(e) => handleThemeChange(e.target.value)}
      style={{
        padding: '4px 8px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        fontSize: '12px',
      }}
    >
      {themes.map((theme) => (
        <option key={theme} value={theme}>
          {theme}
        </option>
      ))}
    </select>
  );
}

