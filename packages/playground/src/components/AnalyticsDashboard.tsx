import { useState, useMemo, useEffect } from 'react';
import type { DesignTokens } from '@tokiforge/core';
import './AnalyticsDashboard.css';

interface AnalyticsDashboardProps {
  tokens: DesignTokens;
}

interface TokenStats {
  total: number;
  byType: {
    color: number;
    spacing: number;
    typography: number;
    other: number;
  };
  bundleSize: {
    total: number;
    byType: Record<string, number>;
  };
}

interface TrendPoint {
  date: string;
  coverage: number;
  totalTokens: number;
  bundleSize: number;
}

export function AnalyticsDashboard({ tokens }: AnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'bundle'>('overview');
  const [trends, setTrends] = useState<TrendPoint[]>([]);

  const stats = useMemo((): TokenStats => {
    let total = 0;
    const byType = {
      color: 0,
      spacing: 0,
      typography: 0,
      other: 0,
    };
    const bundleByType: Record<string, number> = {
      color: 0,
      spacing: 0,
      typography: 0,
      other: 0,
    };

    const analyze = (obj: unknown, path: string = ''): void => {
      if (!obj || typeof obj !== 'object') return;

      if ('value' in obj || '$value' in obj) {
        total++;
        const o = obj as { value?: unknown; $value?: unknown; type?: string };
        const value = o.value ?? o.$value;
        const type = o.type ?? '';
        const pathLower = path.toLowerCase();

        // Estimate size
        const nameSize = path.length + 8;
        const valueSize = String(value).length;
        const tokenSize = nameSize + valueSize;

        if (type === 'color' || pathLower.includes('color')) {
          byType.color++;
          bundleByType.color += tokenSize;
        } else if (type === 'dimension' || pathLower.includes('spacing') || pathLower.includes('size')) {
          byType.spacing++;
          bundleByType.spacing += tokenSize;
        } else if (pathLower.includes('font') || pathLower.includes('typography') || pathLower.includes('text')) {
          byType.typography++;
          bundleByType.typography += tokenSize;
        } else {
          byType.other++;
          bundleByType.other += tokenSize;
        }
      } else {
        const record = obj as Record<string, unknown>;
        for (const key in record) {
          if (Object.prototype.hasOwnProperty.call(record, key)) {
            analyze(record[key], path ? `${path}.${key}` : key);
          }
        }
      }
    };

    analyze(tokens);

    const bundleTotal = Object.values(bundleByType).reduce((sum, size) => sum + size, 0);

    return {
      total,
      byType,
      bundleSize: {
        total: bundleTotal,
        byType: bundleByType,
      },
    };
  }, [tokens]);

  // Simulate trend tracking (in real app, this would persist)
  useEffect(() => {
    const now = new Date();
    const newPoint: TrendPoint = {
      date: now.toISOString().split('T')[0],
      coverage: 75 + Math.random() * 15,
      totalTokens: stats.total,
      bundleSize: stats.bundleSize.total,
    };

    setTrends(prev => {
      const existing = prev.filter(p => p.date !== newPoint.date);
      return [...existing, newPoint].slice(-7); // Keep last 7 days
    });
  }, [stats]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const maxTrendValue = useMemo(() => {
    return Math.max(...trends.map(t => t.totalTokens), 100);
  }, [trends]);

  const maxBundleValue = useMemo(() => {
    return Math.max(...trends.map(t => t.bundleSize), 100);
  }, [trends]);

  return (
    <div className="analytics-dashboard">
      <div className="dashboard-header">
        <h3>📊 Analytics Dashboard</h3>
        <p>Real-time insights into your token usage and bundle size</p>
      </div>

      <div className="dashboard-tabs">
        <button
          type="button"
          className={`dashboard-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          type="button"
          className={`dashboard-tab ${activeTab === 'trends' ? 'active' : ''}`}
          onClick={() => setActiveTab('trends')}
        >
          Trends
        </button>
        <button
          type="button"
          className={`dashboard-tab ${activeTab === 'bundle' ? 'active' : ''}`}
          onClick={() => setActiveTab('bundle')}
        >
          Bundle Analysis
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="metric-cards">
              <div className="metric-card primary">
                <div className="metric-icon">🎨</div>
                <div className="metric-details">
                  <div className="metric-value">{stats.total}</div>
                  <div className="metric-label">Total Tokens</div>
                </div>
              </div>
              <div className="metric-card success">
                <div className="metric-icon">📦</div>
                <div className="metric-details">
                  <div className="metric-value">{formatBytes(stats.bundleSize.total)}</div>
                  <div className="metric-label">Est. Bundle Size</div>
                </div>
              </div>
            </div>

            <div className="distribution-section">
              <h4>Token Distribution</h4>
              <div className="distribution-chart">
                <div
                  className="distribution-bar color"
                  style={{ width: `${(stats.byType.color / stats.total) * 100}%` }}
                  title={`Colors: ${stats.byType.color}`}
                >
                  <span className="bar-label">{stats.byType.color}</span>
                </div>
                <div
                  className="distribution-bar spacing"
                  style={{ width: `${(stats.byType.spacing / stats.total) * 100}%` }}
                  title={`Spacing: ${stats.byType.spacing}`}
                >
                  <span className="bar-label">{stats.byType.spacing}</span>
                </div>
                <div
                  className="distribution-bar typography"
                  style={{ width: `${(stats.byType.typography / stats.total) * 100}%` }}
                  title={`Typography: ${stats.byType.typography}`}
                >
                  <span className="bar-label">{stats.byType.typography}</span>
                </div>
                <div
                  className="distribution-bar other"
                  style={{ width: `${(stats.byType.other / stats.total) * 100}%` }}
                  title={`Other: ${stats.byType.other}`}
                >
                  <span className="bar-label">{stats.byType.other}</span>
                </div>
              </div>
              <div className="distribution-legend">
                <div className="legend-item">
                  <span className="legend-dot color" />
                  Colors ({stats.byType.color})
                </div>
                <div className="legend-item">
                  <span className="legend-dot spacing" />
                  Spacing ({stats.byType.spacing})
                </div>
                <div className="legend-item">
                  <span className="legend-dot typography" />
                  Typography ({stats.byType.typography})
                </div>
                <div className="legend-item">
                  <span className="legend-dot other" />
                  Other ({stats.byType.other})
                </div>
              </div>
            </div>

            <div className="pie-chart-section">
              <h4>Type Breakdown</h4>
              <div className="pie-stats">
                <div className="pie-stat">
                  <div className="pie-stat-bar color" style={{ width: `${(stats.byType.color / stats.total) * 100}%` }} />
                  <div className="pie-stat-label">
                    <span className="pie-stat-name">Colors</span>
                    <span className="pie-stat-value">{((stats.byType.color / stats.total) * 100).toFixed(1)}%</span>
                  </div>
                </div>
                <div className="pie-stat">
                  <div className="pie-stat-bar spacing" style={{ width: `${(stats.byType.spacing / stats.total) * 100}%` }} />
                  <div className="pie-stat-label">
                    <span className="pie-stat-name">Spacing</span>
                    <span className="pie-stat-value">{((stats.byType.spacing / stats.total) * 100).toFixed(1)}%</span>
                  </div>
                </div>
                <div className="pie-stat">
                  <div className="pie-stat-bar typography" style={{ width: `${(stats.byType.typography / stats.total) * 100}%` }} />
                  <div className="pie-stat-label">
                    <span className="pie-stat-name">Typography</span>
                    <span className="pie-stat-value">{((stats.byType.typography / stats.total) * 100).toFixed(1)}%</span>
                  </div>
                </div>
                <div className="pie-stat">
                  <div className="pie-stat-bar other" style={{ width: `${(stats.byType.other / stats.total) * 100}%` }} />
                  <div className="pie-stat-label">
                    <span className="pie-stat-name">Other</span>
                    <span className="pie-stat-value">{((stats.byType.other / stats.total) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="trends-section">
            <div className="trends-header">
              <h4>📈 Token Trends (Last 7 Days)</h4>
              <p>Track token count and bundle size over time</p>
            </div>
            
            <div className="trend-chart" role="img" aria-label={`Token count trend over last 7 days. Max value ${maxTrendValue} tokens.`}>
              <h5>Token Count</h5>
              <div className="chart-container">
                <div className="chart-y-axis">
                  <span>{maxTrendValue}</span>
                  <span>{Math.floor(maxTrendValue / 2)}</span>
                  <span>0</span>
                </div>
                <div className="chart-bars">
                  {trends.map((point, index) => (
                    <div key={index} className="chart-bar-wrapper">
                      <div
                        className="chart-bar"
                        style={{ height: `${(point.totalTokens / maxTrendValue) * 100}%` }}
                        title={`${point.totalTokens} tokens`}
                      />
                      <div className="chart-label">{new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="trend-chart" role="img" aria-label={`Bundle size trend over last 7 days. Max value ${formatBytes(maxBundleValue)}.`}>
              <h5>Bundle Size</h5>
              <div className="chart-container">
                <div className="chart-y-axis">
                  <span>{formatBytes(maxBundleValue)}</span>
                  <span>{formatBytes(Math.floor(maxBundleValue / 2))}</span>
                  <span>0</span>
                </div>
                <div className="chart-bars">
                  {trends.map((point, index) => (
                    <div key={index} className="chart-bar-wrapper">
                      <div
                        className="chart-bar bundle"
                        style={{ height: `${(point.bundleSize / maxBundleValue) * 100}%` }}
                        title={formatBytes(point.bundleSize)}
                      />
                      <div className="chart-label">{new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bundle' && (
          <div className="bundle-section">
            <div className="bundle-header">
              <h4>📦 Bundle Size Analysis</h4>
              <p>Breakdown of estimated CSS bundle size by token type</p>
            </div>

            <div className="bundle-total">
              <div className="bundle-total-icon">📦</div>
              <div className="bundle-total-details">
                <div className="bundle-total-value">{formatBytes(stats.bundleSize.total)}</div>
                <div className="bundle-total-label">Total Estimated Bundle Size</div>
              </div>
            </div>

            <div className="bundle-breakdown">
              <h5>Size by Type</h5>
              <div className="bundle-items">
                <div className="bundle-item">
                  <div className="bundle-item-header">
                    <span className="bundle-item-type">
                      <span className="bundle-dot color" />
                      Colors
                    </span>
                    <span className="bundle-item-size">{formatBytes(stats.bundleSize.byType.color)}</span>
                  </div>
                  <div className="bundle-item-bar">
                    <div
                      className="bundle-item-fill color"
                      style={{ width: `${(stats.bundleSize.byType.color / stats.bundleSize.total) * 100}%` }}
                    />
                  </div>
                  <div className="bundle-item-percentage">
                    {((stats.bundleSize.byType.color / stats.bundleSize.total) * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="bundle-item">
                  <div className="bundle-item-header">
                    <span className="bundle-item-type">
                      <span className="bundle-dot spacing" />
                      Spacing
                    </span>
                    <span className="bundle-item-size">{formatBytes(stats.bundleSize.byType.spacing)}</span>
                  </div>
                  <div className="bundle-item-bar">
                    <div
                      className="bundle-item-fill spacing"
                      style={{ width: `${(stats.bundleSize.byType.spacing / stats.bundleSize.total) * 100}%` }}
                    />
                  </div>
                  <div className="bundle-item-percentage">
                    {((stats.bundleSize.byType.spacing / stats.bundleSize.total) * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="bundle-item">
                  <div className="bundle-item-header">
                    <span className="bundle-item-type">
                      <span className="bundle-dot typography" />
                      Typography
                    </span>
                    <span className="bundle-item-size">{formatBytes(stats.bundleSize.byType.typography)}</span>
                  </div>
                  <div className="bundle-item-bar">
                    <div
                      className="bundle-item-fill typography"
                      style={{ width: `${(stats.bundleSize.byType.typography / stats.bundleSize.total) * 100}%` }}
                    />
                  </div>
                  <div className="bundle-item-percentage">
                    {((stats.bundleSize.byType.typography / stats.bundleSize.total) * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="bundle-item">
                  <div className="bundle-item-header">
                    <span className="bundle-item-type">
                      <span className="bundle-dot other" />
                      Other
                    </span>
                    <span className="bundle-item-size">{formatBytes(stats.bundleSize.byType.other)}</span>
                  </div>
                  <div className="bundle-item-bar">
                    <div
                      className="bundle-item-fill other"
                      style={{ width: `${(stats.bundleSize.byType.other / stats.bundleSize.total) * 100}%` }}
                    />
                  </div>
                  <div className="bundle-item-percentage">
                    {((stats.bundleSize.byType.other / stats.bundleSize.total) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            <div className="bundle-note">
              <strong>Note:</strong> These are estimated sizes based on CSS variable declarations. Actual bundle size may vary depending on minification, compression, and output format.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
