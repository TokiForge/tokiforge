import { useState } from 'react';
import { TokenExporter } from '@tokiforge/core';
import type { DesignTokens } from '@tokiforge/core';
import './ExportShare.css';

interface ExportShareProps {
  tokens: DesignTokens;
  themeName: string;
}

export function ExportShare({ tokens, themeName }: ExportShareProps) {
  const [exportFormat, setExportFormat] = useState<'json' | 'css' | 'typescript' | 'scss'>('json');
  const [cssPrefix, setCssPrefix] = useState('tf');
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>('');

  const generateExport = (): string => {
    switch (exportFormat) {
      case 'json':
        return JSON.stringify(tokens, null, 2);
      
      case 'css':
        return TokenExporter.exportCSS(tokens, { prefix: cssPrefix });
      
      case 'typescript':
        return TokenExporter.exportTS(tokens);
      
      case 'scss':
        return TokenExporter.exportSCSS(tokens, { prefix: cssPrefix });
      
      default:
        return JSON.stringify(tokens, null, 2);
    }
  };

  const exportContent = generateExport();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const extensions: Record<string, string> = {
      json: 'json',
      css: 'css',
      typescript: 'ts',
      scss: 'scss',
    };

    const blob = new Blob([exportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tokens-${themeName}.${extensions[exportFormat]}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleGenerateShareLink = () => {
    // Compress and encode tokens for URL
    const compressed = btoa(JSON.stringify(tokens));
    const url = `${window.location.origin}${window.location.pathname}?tokens=${encodeURIComponent(compressed)}`;
    setShareUrl(url);
  };

  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Share link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy share link:', err);
    }
  };

  return (
    <div className="export-share">
      <h3>Export & Share</h3>

      <div className="export-options">
        <div className="option-group">
          <label>Export Format</label>
          <select 
            value={exportFormat} 
            onChange={(e) => setExportFormat(e.target.value as any)}
          >
            <option value="json">JSON</option>
            <option value="css">CSS Variables</option>
            <option value="typescript">TypeScript</option>
            <option value="scss">SCSS Variables</option>
          </select>
        </div>

        {(exportFormat === 'css' || exportFormat === 'scss') && (
          <div className="option-group">
            <label>CSS Prefix</label>
            <input
              type="text"
              value={cssPrefix}
              onChange={(e) => setCssPrefix(e.target.value)}
              placeholder="tf"
            />
          </div>
        )}
      </div>

      <div className="export-preview">
        <div className="preview-header">
          <span className="preview-title">Preview</span>
          <div className="preview-actions">
            <button onClick={handleCopy} className="btn-icon" title="Copy to clipboard">
              {copied ? '✓ Copied!' : '📋 Copy'}
            </button>
            <button onClick={handleDownload} className="btn-icon" title="Download file">
              💾 Download
            </button>
          </div>
        </div>
        <pre className="code-preview">
          <code>{exportContent}</code>
        </pre>
      </div>

      <div className="share-section">
        <h4>Share Configuration</h4>
        <p className="share-description">
          Generate a shareable link to your token configuration
        </p>
        
        <button onClick={handleGenerateShareLink} className="btn-primary">
          🔗 Generate Share Link
        </button>

        {shareUrl && (
          <div className="share-url-container">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="share-url-input"
            />
            <button onClick={handleCopyShareLink} className="btn-secondary">
              Copy Link
            </button>
          </div>
        )}

        {shareUrl && (
          <div className="share-warning">
            ⚠️ Note: Large token sets may exceed URL length limits. Consider downloading instead.
          </div>
        )}
      </div>

      <div className="code-snippets">
        <h4>Quick Start Snippets</h4>
        
        <div className="snippet">
          <div className="snippet-header">React Usage</div>
          <pre className="snippet-code"><code>{`import { ThemeRuntime } from '@tokiforge/core';
import tokens from './tokens.json';

const runtime = new ThemeRuntime({
  themes: [{ name: '${themeName}', tokens }],
  defaultTheme: '${themeName}',
});

runtime.init();`}</code></pre>
        </div>

        <div className="snippet">
          <div className="snippet-header">CSS Import</div>
          <pre className="snippet-code"><code>{`<!-- Add to your HTML -->
<style>
${TokenExporter.exportCSS(tokens, { prefix: cssPrefix }).split('\n').slice(0, 5).join('\n')}
  ...
</style>`}</code></pre>
        </div>

        <div className="snippet">
          <div className="snippet-header">Vue Composition API</div>
          <pre className="snippet-code"><code>{`import { useTheme } from '@tokiforge/vue';
import tokens from './tokens.json';

const { theme, setTheme } = useTheme({
  themes: [{ name: '${themeName}', tokens }],
  defaultTheme: '${themeName}',
});`}</code></pre>
        </div>
      </div>
    </div>
  );
}
