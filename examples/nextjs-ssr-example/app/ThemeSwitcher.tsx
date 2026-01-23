'use client';

import { useTheme } from '@tokiforge/react';
import { setThemeAction } from './actions';
import { useTransition } from 'react';

/**
 * Theme switcher component.
 * Uses server action to persist theme changes.
 */
export function ThemeSwitcher() {
  const { theme, availableThemes, setTheme } = useTheme();
  const [isPending, startTransition] = useTransition();

  const handleThemeChange = async (newTheme: string) => {
    // Optimistically update UI
    setTheme(newTheme);
    
    // Persist to server
    startTransition(async () => {
      await setThemeAction(newTheme);
    });
  };

  return (
    <div style={{
      display: 'flex',
      gap: 'var(--hf-sm)',
      alignItems: 'center',
    }}>
      <label htmlFor="theme-select" style={{
        fontSize: 'var(--hf-md)',
        color: 'var(--hf-text-primary)',
      }}>
        Theme:
      </label>
      <select
        id="theme-select"
        value={theme}
        onChange={(e) => handleThemeChange(e.target.value)}
        disabled={isPending}
        style={{
          padding: 'var(--hf-sm) var(--hf-md)',
          borderRadius: 'var(--hf-md)',
          border: '1px solid var(--hf-border)',
          backgroundColor: 'var(--hf-surface)',
          color: 'var(--hf-text-primary)',
          fontSize: 'var(--hf-md)',
          cursor: isPending ? 'wait' : 'pointer',
        }}
      >
        {availableThemes.map((t) => (
          <option key={t} value={t}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </option>
        ))}
      </select>
      {isPending && <span style={{ fontSize: 'var(--hf-sm)', color: 'var(--hf-text-secondary)' }}>Saving...</span>}
    </div>
  );
}
