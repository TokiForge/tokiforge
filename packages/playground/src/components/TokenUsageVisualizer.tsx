import { useMemo } from 'react';
import type { DesignTokens } from '@tokiforge/core';
import './TokenUsageVisualizer.css';

interface TokenUsageVisualizerProps {
  tokens: DesignTokens;
}

interface TokenNode {
  path: string;
  value: any;
  type?: string;
  children: TokenNode[];
  depth: number;
  isLeaf: boolean;
  references: string[];
}

export function TokenUsageVisualizer({ tokens }: TokenUsageVisualizerProps) {
  const tokenTree = useMemo(() => {
    const buildTree = (obj: any, path: string = '', depth: number = 0): TokenNode[] => {
      const nodes: TokenNode[] = [];

      if (!obj || typeof obj !== 'object') {
        return nodes;
      }

      if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          nodes.push(...buildTree(item, `${path}[${index}]`, depth));
        });
        return nodes;
      }

      if ('value' in obj || '$value' in obj) {
        const value = obj.value || obj.$value;
        const references: string[] = [];
        
        // Check for alias references
        if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
          references.push(value.slice(1, -1));
        }

        nodes.push({
          path,
          value,
          type: obj.type,
          children: [],
          depth,
          isLeaf: true,
          references,
        });
      } else {
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const newPath = path ? `${path}.${key}` : key;
            const childNodes = buildTree(obj[key], newPath, depth + 1);
            
            if (childNodes.length > 0) {
              nodes.push({
                path: newPath,
                value: obj[key],
                children: childNodes,
                depth,
                isLeaf: false,
                references: [],
              });
            }
          }
        }
      }

      return nodes;
    };

    return buildTree(tokens);
  }, [tokens]);

  const tokenStats = useMemo(() => {
    let totalTokens = 0;
    let colorTokens = 0;
    let spacingTokens = 0;
    let typographyTokens = 0;
    let otherTokens = 0;
    let aliasTokens = 0;

    const countTokens = (nodes: TokenNode[]) => {
      nodes.forEach((node) => {
        if (node.isLeaf) {
          totalTokens++;
          
          if (node.references.length > 0) {
            aliasTokens++;
          }
          
          if (node.type === 'color' || node.path.includes('color')) {
            colorTokens++;
          } else if (node.type === 'dimension' || node.path.includes('spacing') || node.path.includes('size')) {
            spacingTokens++;
          } else if (node.path.includes('font') || node.path.includes('typography') || node.path.includes('text')) {
            typographyTokens++;
          } else {
            otherTokens++;
          }
        }
        
        if (node.children.length > 0) {
          countTokens(node.children);
        }
      });
    };

    countTokens(tokenTree);

    return {
      totalTokens,
      colorTokens,
      spacingTokens,
      typographyTokens,
      otherTokens,
      aliasTokens,
    };
  }, [tokenTree]);

  const renderTokenNode = (node: TokenNode, index: number) => {
    const indent = node.depth * 20;
    
    if (node.isLeaf) {
      return (
        <div 
          key={`${node.path}-${index}`} 
          className="token-node leaf"
          style={{ paddingLeft: `${indent}px` }}
        >
          <div className="token-node-header">
            <span className="token-icon">
              {node.type === 'color' ? '🎨' : node.type === 'dimension' ? '📏' : '📝'}
            </span>
            <span className="token-path">{node.path.split('.').pop()}</span>
            {node.type && <span className="token-type">{node.type}</span>}
            {node.references.length > 0 && (
              <span className="token-alias" title={`References: ${node.references.join(', ')}`}>
                🔗 alias
              </span>
            )}
          </div>
          <div className="token-value">
            {node.type === 'color' && typeof node.value === 'string' && node.value.startsWith('#') ? (
              <div className="color-value">
                <div 
                  className="color-swatch-small" 
                  style={{ backgroundColor: node.value }} 
                />
                <span>{node.value}</span>
              </div>
            ) : (
              <span>{String(node.value)}</span>
            )}
          </div>
        </div>
      );
    }

    return (
      <div 
        key={`${node.path}-${index}`} 
        className="token-node group"
        style={{ paddingLeft: `${indent}px` }}
      >
        <div className="token-group-header">
          <span className="token-group-icon">📁</span>
          <span className="token-group-name">{node.path.split('.').pop()}</span>
          <span className="token-group-count">({node.children.length})</span>
        </div>
        <div className="token-group-children">
          {node.children.map((child, idx) => renderTokenNode(child, idx))}
        </div>
      </div>
    );
  };

  return (
    <div className="token-usage-visualizer">
      <h3>Token Usage & Structure</h3>

      <div className="token-stats">
        <div className="stat-card total">
          <div className="stat-value">{tokenStats.totalTokens}</div>
          <div className="stat-label">Total Tokens</div>
        </div>
        <div className="stat-card color">
          <div className="stat-value">{tokenStats.colorTokens}</div>
          <div className="stat-label">Colors</div>
        </div>
        <div className="stat-card spacing">
          <div className="stat-value">{tokenStats.spacingTokens}</div>
          <div className="stat-label">Spacing</div>
        </div>
        <div className="stat-card typography">
          <div className="stat-value">{tokenStats.typographyTokens}</div>
          <div className="stat-label">Typography</div>
        </div>
        <div className="stat-card alias">
          <div className="stat-value">{tokenStats.aliasTokens}</div>
          <div className="stat-label">Aliases</div>
        </div>
      </div>

      <div className="token-distribution">
        <h4>Token Distribution</h4>
        <div className="distribution-bar">
          <div 
            className="distribution-segment color"
            style={{ width: `${(tokenStats.colorTokens / tokenStats.totalTokens) * 100}%` }}
            title={`Colors: ${tokenStats.colorTokens}`}
          />
          <div 
            className="distribution-segment spacing"
            style={{ width: `${(tokenStats.spacingTokens / tokenStats.totalTokens) * 100}%` }}
            title={`Spacing: ${tokenStats.spacingTokens}`}
          />
          <div 
            className="distribution-segment typography"
            style={{ width: `${(tokenStats.typographyTokens / tokenStats.totalTokens) * 100}%` }}
            title={`Typography: ${tokenStats.typographyTokens}`}
          />
          <div 
            className="distribution-segment other"
            style={{ width: `${(tokenStats.otherTokens / tokenStats.totalTokens) * 100}%` }}
            title={`Other: ${tokenStats.otherTokens}`}
          />
        </div>
        <div className="distribution-legend">
          <span className="legend-item color">
            <span className="legend-dot" /> Colors ({Math.round((tokenStats.colorTokens / tokenStats.totalTokens) * 100)}%)
          </span>
          <span className="legend-item spacing">
            <span className="legend-dot" /> Spacing ({Math.round((tokenStats.spacingTokens / tokenStats.totalTokens) * 100)}%)
          </span>
          <span className="legend-item typography">
            <span className="legend-dot" /> Typography ({Math.round((tokenStats.typographyTokens / tokenStats.totalTokens) * 100)}%)
          </span>
          <span className="legend-item other">
            <span className="legend-dot" /> Other ({Math.round((tokenStats.otherTokens / tokenStats.totalTokens) * 100)}%)
          </span>
        </div>
      </div>

      <div className="token-tree">
        <h4>Token Hierarchy</h4>
        <div className="token-tree-container">
          {tokenTree.map((node, index) => renderTokenNode(node, index))}
        </div>
      </div>
    </div>
  );
}
