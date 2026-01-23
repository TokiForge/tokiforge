/**
 * @tokiforge/figma - Figma integration with Tokens Studio support
 * 
 * Provides:
 * - Bidirectional token synchronization with Figma
 * - Tokens Studio API integration
 * - Comprehensive conflict resolution system
 * - Figma plugin for enhanced sync capabilities
 */

// Re-export from enhanced modules
export { FigmaSync, pullFromFigma, pushToFigma, type FigmaConfig, type BidirectionalSyncState } from './figma-sync-enhanced';
export { TokensStudioAPI, syncWithTokensStudio, type TokensStudioConfig, type SyncState, type ConflictInfo } from './tokens-studio-api';
export {
  ConflictResolver,
  detectConflictType,
  calculateSeverity,
  type Conflict,
  type ConflictResolution,
  type ConflictStrategy,
  ConflictType,
} from './conflict-resolver';

// Re-export types
export type { FigmaColor, FigmaStyle } from './figma-sync-enhanced';


