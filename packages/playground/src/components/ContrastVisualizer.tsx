import { useState, useMemo } from 'react';
import { AccessibilityUtils } from '@tokiforge/core';
import type { DesignTokens } from '@tokiforge/core';
import './ContrastVisualizer.css';

interface ContrastVisualizerProps {
  readonly tokens: DesignTokens;
}

interface ColorToken {
  path: string;
  value: string;
}

export function ContrastVisualizer({ tokens }: ContrastVisualizerProps) {
  const [selectedColor1, setSelectedColor1] = useState<string>('');
  const [selectedColor2, setSelectedColor2] = useState<string>('');

  const colorTokens = useMemo(() => {
    const colors: ColorToken[] = [];
    
    const extractColors = (obj: unknown, path: string = ''): void => {
      if (!obj || typeof obj !== 'object') return;

      if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          extractColors(item, `${path}[${index}]`);
        });
        return;
      }

      const o = obj as Record<string, unknown>;
      if ('value' in o && o.type === 'color' && typeof o.value === 'string') {
        colors.push({ path, value: o.value });
      } else {
        for (const key in o) {
          if (Object.prototype.hasOwnProperty.call(o, key)) {
            const newPath = path ? `${path}.${key}` : key;
            extractColors(o[key], newPath);
          }
        }
      }
    };

    extractColors(tokens);
    return colors;
  }, [tokens]);

  const contrastResult = useMemo(() => {
    if (!selectedColor1 || !selectedColor2) return null;
    try {
      return AccessibilityUtils.calculateContrast(selectedColor1, selectedColor2);
    } catch {
      return null;
    }
  }, [selectedColor1, selectedColor2]);

  return (
    <div className="contrast-visualizer">
      <h3>Contrast Ratio Checker</h3>
      
      <div className="color-selectors">
        <div className="color-selector">
          <label htmlFor="contrast-foreground">Foreground Color</label>
          <select
            id="contrast-foreground"
            value={selectedColor1}
            onChange={(e) => setSelectedColor1(e.target.value)}
            aria-label="Select foreground color"
          >
            <option value="">Select a color...</option>
            {colorTokens.map((token) => (
              <option key={token.path} value={token.value}>
                {token.path} ({token.value})
              </option>
            ))}
          </select>
          {selectedColor1 && (
            <div 
              className="color-preview-large" 
              style={{ backgroundColor: selectedColor1 }}
            />
          )}
        </div>

        <div className="color-selector">
          <label htmlFor="contrast-background">Background Color</label>
          <select
            id="contrast-background"
            value={selectedColor2}
            onChange={(e) => setSelectedColor2(e.target.value)}
            aria-label="Select background color"
          >
            <option value="">Select a color...</option>
            {colorTokens.map((token) => (
              <option key={token.path} value={token.value}>
                {token.path} ({token.value})
              </option>
            ))}
          </select>
          {selectedColor2 && (
            <div 
              className="color-preview-large" 
              style={{ backgroundColor: selectedColor2 }}
            />
          )}
        </div>
      </div>

      {contrastResult && (
        <div className="contrast-results">
          <div className="contrast-preview" style={{
            backgroundColor: selectedColor2,
            color: selectedColor1,
          }}>
            <h2>Sample Text</h2>
            <p>The quick brown fox jumps over the lazy dog</p>
          </div>

          <div className="contrast-metrics">
            <div className="contrast-ratio">
              <div className="ratio-number">{contrastResult.ratio}:1</div>
              <div className="ratio-label">Contrast Ratio</div>
            </div>

            <div className="wcag-compliance">
              <div className={`compliance-item ${contrastResult.wcagAA ? 'pass' : 'fail'}`}>
                <div className="compliance-icon">
                  {contrastResult.wcagAA ? '✓' : '✗'}
                </div>
                <div className="compliance-label">
                  <strong>WCAG AA</strong>
                  <span>Normal Text (4.5:1)</span>
                </div>
              </div>

              <div className={`compliance-item ${contrastResult.wcagAAA ? 'pass' : 'fail'}`}>
                <div className="compliance-icon">
                  {contrastResult.wcagAAA ? '✓' : '✗'}
                </div>
                <div className="compliance-label">
                  <strong>WCAG AAA</strong>
                  <span>Normal Text (7:1)</span>
                </div>
              </div>

              <div className={`compliance-item ${contrastResult.ratio >= 3 ? 'pass' : 'fail'}`}>
                <div className="compliance-icon">
                  {contrastResult.ratio >= 3 ? '✓' : '✗'}
                </div>
                <div className="compliance-label">
                  <strong>WCAG AA Large</strong>
                  <span>Large Text (3:1)</span>
                </div>
              </div>

              <div className={`compliance-item ${contrastResult.ratio >= 4.5 ? 'pass' : 'fail'}`}>
                <div className="compliance-icon">
                  {contrastResult.ratio >= 4.5 ? '✓' : '✗'}
                </div>
                <div className="compliance-label">
                  <strong>WCAG AAA Large</strong>
                  <span>Large Text (4.5:1)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="contrast-matrix">
            <h4>All Color Combinations</h4>
            <div className="matrix-grid">
              {colorTokens.slice(0, 6).map((fg) => (
                <div key={fg.path} className="matrix-row">
                  {colorTokens.slice(0, 6).map((bg) => {
                    if (fg.value === bg.value) {
                      return <div key={bg.path} className="matrix-cell empty" />;
                    }
                    try {
                      const contrast = AccessibilityUtils.calculateContrast(fg.value, bg.value);
                      return (
                        <div
                          key={bg.path}
                          className={`matrix-cell ${contrast.wcagAA ? 'pass' : 'fail'}`}
                          title={`${fg.path} on ${bg.path}: ${contrast.ratio}:1`}
                        >
                          {contrast.ratio}
                        </div>
                      );
                    } catch {
                      return <div key={bg.path} className="matrix-cell error">-</div>;
                    }
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!selectedColor1 || !selectedColor2 ? (
        <div className="contrast-placeholder">
          Select two colors to check their contrast ratio and WCAG compliance
        </div>
      ) : null}
    </div>
  );
}
