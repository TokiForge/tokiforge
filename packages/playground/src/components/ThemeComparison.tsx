import { useMemo, memo } from 'react';
import type { DesignTokens, ThemeConfig } from '@tokiforge/core';
import './ThemeComparison.css';

interface ThemeComparisonProps {
  config: ThemeConfig;
}

interface FlatEntry { value: unknown; type?: string }

interface ComparisonRowData {
  path: string;
  values: (FlatEntry | undefined)[];
  hasDifference: boolean;
}

const ComparisonTableRow = memo(function ComparisonTableRow({ row }: { row: ComparisonRowData }) {
  return (
    <tr className={row.hasDifference ? 'has-difference' : ''}>
      <td className="token-path">{row.path}</td>
      {row.values.map((value, idx) => {
        if (!value) {
          return (
            <td key={`${row.path}-${idx}-missing`} className="token-value missing">
              <span className="missing-indicator">—</span>
            </td>
          );
        }
        const isColor = value.type === 'color' && typeof value.value === 'string' && value.value.startsWith('#');
        return (
          <td key={`${row.path}-${idx}`} className="token-value">
            {isColor ? (
              <div className="color-token-value">
                <div className="color-swatch-tiny" style={{ backgroundColor: value.value as string }} />
                <span>{String(value.value)}</span>
              </div>
            ) : (
              <span>{String(value.value)}</span>
            )}
          </td>
        );
      })}
      <td className="token-status">
        {row.hasDifference ? (
          <span className="status-badge different">Different</span>
        ) : (
          <span className="status-badge same">Same</span>
        )}
      </td>
    </tr>
  );
});

function flattenTokensImpl(tokens: DesignTokens, prefix: string): Map<string, FlatEntry> {
  const flat = new Map<string, FlatEntry>();

  const flatten = (obj: unknown, path: string): void => {
    if (!obj || typeof obj !== 'object') return;

    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        flatten(item, `${path}[${index}]`);
      });
      return;
    }

    if ('value' in obj || '$value' in obj) {
      const o = obj as { value?: unknown; $value?: unknown; type?: string };
      flat.set(path, { value: o.value ?? o.$value, type: o.type });
    } else {
      const record = obj as Record<string, unknown>;
      for (const key in record) {
        if (Object.prototype.hasOwnProperty.call(record, key)) {
          const newPath = path ? `${path}.${key}` : key;
          flatten(record[key], newPath);
        }
      }
    }
  };

  flatten(tokens, prefix);
  return flat;
}

export function ThemeComparison({ config }: Readonly<ThemeComparisonProps>) {
  const themes = config.themes || [];

  const comparisonData = useMemo(() => {
    const allTokenPaths = new Set<string>();
    const themeData = themes.map((theme) => ({
      name: theme.name,
      tokens: flattenTokensImpl(theme.tokens, ''),
    }));

    // Collect all token paths across all themes
    themeData.forEach(({ tokens }) => {
      tokens.forEach((_, path) => allTokenPaths.add(path));
    });

    // Build comparison rows
    const rows = Array.from(allTokenPaths).map((path) => {
      const values = themeData.map(({ tokens }) => tokens.get(path));
      const allSame = values.every((v) => {
        return JSON.stringify(v) === JSON.stringify(values[0]);
      });

      return {
        path,
        values,
        allSame,
        hasDifference: !allSame,
      };
    });

    return { rows, themeData };
  }, [themes]);

  const stats = useMemo(() => {
    const differentTokens = comparisonData.rows.filter((r) => r.hasDifference).length;
    const totalTokens = comparisonData.rows.length;
    const sameTokens = totalTokens - differentTokens;

    return {
      totalTokens,
      differentTokens,
      sameTokens,
      differencePercentage: totalTokens > 0 ? Math.round((differentTokens / totalTokens) * 100) : 0,
    };
  }, [comparisonData]);

  if (themes.length < 2) {
    return (
      <div className="theme-comparison">
        <h3>Theme Comparison</h3>
        <div className="comparison-placeholder">
          Add at least two themes to enable comparison
        </div>
      </div>
    );
  }

  const sortedRows = [...comparisonData.rows].sort((a, b) =>
    a.hasDifference === b.hasDifference ? 0 : a.hasDifference ? -1 : 1
  );

  return (
    <div className="theme-comparison">
      <h3>Theme Comparison</h3>

      <div className="comparison-stats">
        <div className="comparison-stat">
          <div className="stat-value">{stats.totalTokens}</div>
          <div className="stat-label">Total Tokens</div>
        </div>
        <div className="comparison-stat same">
          <div className="stat-value">{stats.sameTokens}</div>
          <div className="stat-label">Same Values</div>
        </div>
        <div className="comparison-stat different">
          <div className="stat-value">{stats.differentTokens}</div>
          <div className="stat-label">Different Values</div>
        </div>
        <div className="comparison-stat percentage">
          <div className="stat-value">{stats.differencePercentage}%</div>
          <div className="stat-label">Difference</div>
        </div>
      </div>

      <div className="comparison-table-container">
        <table className="comparison-table">
          <thead>
            <tr>
              <th className="token-path-header">Token Path</th>
              {comparisonData.themeData.map(({ name }) => (
                <th key={name} className="theme-header">
                  {name}
                </th>
              ))}
              <th className="status-header">Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row) => (
              <ComparisonTableRow key={row.path} row={row} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
