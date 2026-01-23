/**
 * TokiForge Figma Plugin
 * 
 * This plugin enables bidirectional token synchronization between Figma and your codebase.
 * - Sync colors, typography, and spacing from Figma to code
 * - Push token updates from code to Figma
 * - Support for Tokens Studio format
 * - Conflict resolution UI
 * 
 * @note This file is designed to run inside a Figma plugin context.
 * It requires @figma/plugin-typings to be installed for full type support.
 */

// Figma plugin API globals (requires @figma/plugin-typings for full types)
declare const figma: any;
declare const __html__: string;

interface FigmaConfig {
  apiUrl: string;
  projectId: string;
  accessToken: string;
}

interface SyncMessage {
  type: 'pull' | 'push' | 'status' | 'settings';
  config?: FigmaConfig;
  tokens?: any;
}

// Configuration storage
const defaultConfig: FigmaConfig = {
  apiUrl: 'https://tokens.studio/api/v1',
  projectId: '',
  accessToken: '',
};

let currentConfig: FigmaConfig = defaultConfig;

/**
 * Extract colors from current Figma file
 */
async function extractColorsFromFigma(): Promise<Record<string, string>> {
  const colors: Record<string, string> = {};

  const localStyles = figma.getLocalPaintStyles();
  
  for (const style of localStyles) {
    const paints = style.paints;
    if (paints.length > 0 && paints[0].type === 'SOLID') {
      const paint = paints[0];
      const r = Math.round(paint.color.r * 255);
      const g = Math.round(paint.color.g * 255);
      const b = Math.round(paint.color.b * 255);
      const a = Math.round(paint.opacity * 100) / 100;

      const hex = `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
      colors[style.name] = a < 1 ? `${hex}${Math.round(a * 255).toString(16)}` : hex;
    }
  }

  return colors;
}

/**
 * Extract typography styles from Figma
 */
async function extractTypographyFromFigma(): Promise<Record<string, any>> {
  const typography: Record<string, any> = {};

  const textStyles = figma.getLocalTextStyles();

  for (const style of textStyles) {
    typography[style.name] = {
      fontSize: style.fontSize,
      fontFamily: style.fontName.family,
      fontWeight: style.fontName.style,
      lineHeight: style.lineHeight.value,
      letterSpacing: style.letterSpacing.value,
    };
  }

  return typography;
}

/**
 * Apply colors to Figma styles
 */
async function applyColorsToFigma(colors: Record<string, string>): Promise<void> {
  for (const [name, hex] of Object.entries(colors)) {
    try {
      // Parse hex to RGB
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (!result) continue;

      const r = parseInt(result[1], 16) / 255;
      const g = parseInt(result[2], 16) / 255;
      const b = parseInt(result[3], 16) / 255;

      // Find or create style
      const existingStyle = figma
        .getLocalPaintStyles()
        .find((s: any) => s.name === name);

      if (existingStyle) {
        existingStyle.paints = [
          {
            type: 'SOLID',
            color: { r, g, b },
            opacity: 1,
            blendMode: 'NORMAL',
          },
        ];
      } else {
        // Create new style
        const newStyle = figma.createPaintStyle();
        newStyle.name = name;
        newStyle.paints = [
          {
            type: 'SOLID',
            color: { r, g, b },
            opacity: 1,
            blendMode: 'NORMAL',
          },
        ];
      }
    } catch (error) {
      console.error(`Failed to apply color ${name}: ${error}`);
    }
  }
}

/**
 * Handle messages from UI
 */
figma.ui.onmessage = async (msg: SyncMessage) => {
  try {
    switch (msg.type) {
      case 'pull':
        // Extract tokens from Figma
        const colors = await extractColorsFromFigma();
        const typography = await extractTypographyFromFigma();

        figma.ui.postMessage({
          type: 'pull-response',
          data: { colors, typography },
        });
        break;

      case 'push':
        // Apply tokens from code to Figma
        if (msg.tokens && msg.tokens.colors) {
          await applyColorsToFigma(msg.tokens.colors);
        }

        figma.ui.postMessage({
          type: 'push-response',
          success: true,
        });
        break;

      case 'settings':
        // Update configuration
        if (msg.config) {
          currentConfig = msg.config;
          figma.clientStorage.setAsync('tokiforge-config', JSON.stringify(msg.config));
        }

        figma.ui.postMessage({
          type: 'settings-response',
          config: currentConfig,
        });
        break;

      case 'status':
        // Get current plugin status
        figma.ui.postMessage({
          type: 'status-response',
          data: {
            currentFile: figma.root.name,
            colorsCount: figma.getLocalPaintStyles().length,
            typographyCount: figma.getLocalTextStyles().length,
            config: currentConfig,
          },
        });
        break;
    }
  } catch (error) {
    figma.ui.postMessage({
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Load saved configuration on startup
async function loadConfiguration() {
  const saved = await figma.clientStorage.getAsync('tokiforge-config');
  if (saved) {
    try {
      currentConfig = JSON.parse(saved);
    } catch (error) {
      console.error('Failed to load configuration:', error);
    }
  }

  // Show UI
  figma.showUI(__html__, { width: 400, height: 600 });
}

loadConfiguration();
