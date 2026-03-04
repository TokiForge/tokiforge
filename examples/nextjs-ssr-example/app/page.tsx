import { ThemeSwitcher } from './ThemeSwitcher';

export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: 'var(--hf-background)',
      color: 'var(--hf-text-primary)',
      padding: 'var(--hf-xl)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
      }}>
        <header style={{
          marginBottom: 'var(--hf-xl)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 'var(--hf-lg)',
          backgroundColor: 'var(--hf-surface)',
          borderRadius: 'var(--hf-lg)',
          border: '1px solid var(--hf-border)',
        }}>
          <h1 style={{
            fontSize: 'var(--hf-xl)',
            margin: 0,
            color: 'var(--hf-primary)',
          }}>
            TokiForge + Next.js
          </h1>
          <ThemeSwitcher />
        </header>

        <section style={{
          backgroundColor: 'var(--hf-surface)',
          padding: 'var(--hf-lg)',
          borderRadius: 'var(--hf-lg)',
          border: '1px solid var(--hf-border)',
          marginBottom: 'var(--hf-lg)',
        }}>
          <h2 style={{
            fontSize: 'var(--hf-lg)',
            marginTop: 0,
            color: 'var(--hf-primary)',
          }}>
            Server-Side Rendering Example
          </h2>
          <p style={{
            fontSize: 'var(--hf-md)',
            lineHeight: '1.6',
            color: 'var(--hf-text-primary)',
          }}>
            This example demonstrates TokiForge with Next.js App Router including:
          </p>
          <ul style={{
            fontSize: 'var(--hf-md)',
            lineHeight: '1.8',
            color: 'var(--hf-text-secondary)',
          }}>
            <li>✅ Server-Side Rendering (SSR)</li>
            <li>✅ Hydration-safe theme switching</li>
            <li>✅ Cookie-based persistence</li>
            <li>✅ Zero FOUC (Flash of Unstyled Content)</li>
            <li>✅ Critical CSS inline injection</li>
          </ul>
        </section>

        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 'var(--hf-lg)',
        }}>
          <div style={{
            backgroundColor: 'var(--hf-surface)',
            padding: 'var(--hf-lg)',
            borderRadius: 'var(--hf-lg)',
            border: '1px solid var(--hf-border)',
          }}>
            <h3 style={{
              fontSize: 'var(--hf-lg)',
              marginTop: 0,
              color: 'var(--hf-primary)',
            }}>
              Primary Button
            </h3>
            <button type="button" style={{
              backgroundColor: 'var(--hf-primary)',
              color: 'var(--hf-background)',
              padding: 'var(--hf-sm) var(--hf-lg)',
              borderRadius: 'var(--hf-md)',
              border: 'none',
              fontSize: 'var(--hf-md)',
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}>
              Click Me
            </button>
          </div>

          <div style={{
            backgroundColor: 'var(--hf-surface)',
            padding: 'var(--hf-lg)',
            borderRadius: 'var(--hf-lg)',
            border: '1px solid var(--hf-border)',
          }}>
            <h3 style={{
              fontSize: 'var(--hf-lg)',
              marginTop: 0,
              color: 'var(--hf-secondary)',
            }}>
              Secondary Button
            </h3>
            <button type="button" style={{
              backgroundColor: 'var(--hf-secondary)',
              color: 'var(--hf-background)',
              padding: 'var(--hf-sm) var(--hf-lg)',
              borderRadius: 'var(--hf-md)',
              border: 'none',
              fontSize: 'var(--hf-md)',
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}>
              Click Me
            </button>
          </div>

          <div style={{
            backgroundColor: 'var(--hf-surface)',
            padding: 'var(--hf-lg)',
            borderRadius: 'var(--hf-lg)',
            border: '1px solid var(--hf-border)',
          }}>
            <h3 style={{
              fontSize: 'var(--hf-lg)',
              marginTop: 0,
              color: 'var(--hf-text-primary)',
            }}>
              Input Field
            </h3>
            <input
              type="text"
              placeholder="Type something..."
              style={{
                width: '100%',
                padding: 'var(--hf-sm)',
                borderRadius: 'var(--hf-sm)',
                border: '1px solid var(--hf-border)',
                backgroundColor: 'var(--hf-background)',
                color: 'var(--hf-text-primary)',
                fontSize: 'var(--hf-md)',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </section>

        <footer style={{
          marginTop: 'var(--hf-xl)',
          padding: 'var(--hf-lg)',
          textAlign: 'center',
          color: 'var(--hf-text-secondary)',
          fontSize: 'var(--hf-sm)',
        }}>
          <p>
            Built with <span style={{ color: 'var(--hf-primary)' }}>TokiForge</span> and <span style={{ color: 'var(--hf-secondary)' }}>Next.js</span>
          </p>
        </footer>
      </div>
    </main>
  );
}
