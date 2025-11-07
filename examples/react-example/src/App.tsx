import { ThemeProvider, useTheme } from '@tokiforge/react';
import tokens from './tokens.json';
import './App.css';

// Create theme config
const themeConfig = {
  themes: [
    {
      name: 'light',
      tokens: {
        ...tokens,
        color: {
          ...tokens.color,
          text: {
            primary: { value: '#1E293B', type: 'color' },
            secondary: { value: '#64748B', type: 'color' },
          },
        },
      },
    },
    {
      name: 'dark',
      tokens: {
        ...tokens,
        color: {
          ...tokens.color,
          text: {
            primary: { value: '#F8FAFC', type: 'color' },
            secondary: { value: '#CBD5E1', type: 'color' },
          },
          background: {
            default: { value: '#0F172A', type: 'color' },
            muted: { value: '#1E293B', type: 'color' },
          },
        },
      },
    },
  ],
  defaultTheme: 'light',
};

function Button() {
  const { setTheme, theme } = useTheme();
  
  return (
    <button
      className="theme-button"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      Switch to {theme === 'light' ? 'Dark' : 'Light'} Theme
    </button>
  );
}

function TokensDisplay() {
  const { tokens: themeTokens } = useTheme();
  
  return (
    <div style={{ marginTop: '2rem' }}>
      <h2>Theme Tokens</h2>
      <pre style={{ 
        backgroundColor: 'var(--hf-color-background-muted)', 
        padding: '1rem',
        borderRadius: 'var(--hf-radius-md)',
        overflow: 'auto'
      }}>
        {JSON.stringify(themeTokens, null, 2)}
      </pre>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider config={themeConfig}>
      <div
        style={{
          minHeight: '100vh',
          padding: '2rem',
          backgroundColor: 'var(--hf-color-background-default)',
          color: 'var(--hf-color-text-primary)',
          transition: 'background-color 0.3s, color 0.3s',
        }}
      >
        <h1>TokiForge React Example</h1>
        <p>This demonstrates the TokiForge theming system with React.</p>
        <Button />
        <TokensDisplay />
      </div>
    </ThemeProvider>
  );
}

export default App;

