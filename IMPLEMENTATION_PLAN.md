# TokiForge Implementation Plan

## Quick Reference: Feature Status

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Semantic Tokens & Aliasing | Partial | Critical | Needs layer resolution enhancement |
| Multi-Platform Exporters | Missing | Critical | iOS, Android, React Native needed |
| Figma ↔ Code Sync | Basic | High | Needs Tokens Studio integration |
| Tailwind Plugin & Export | Basic | High | Needs plugin format |
| Type Generation & IDE | API Only | High | Needs CLI command |
| CLI Tooling Enhancements | Partial | High | Needs migrate, watch commands |
| Visual Playground | Basic | Medium | Needs enhancement |
| Accessibility Checks | Complete | Done | Fully implemented |
| Zero-JS + SSR | Needs Verification | High | Needs testing & docs |
| Plugin Architecture | Complete | Done | Fully implemented |
| Versioning & Governance | Complete | Done | Needs changelog generation |
| CI / Visual Regression | Basic | Medium | Needs Storybook recipes |
| Usage Analytics | Complete | Done | Needs better reporting |

---

## Phase 1: Critical Enhancements (Week 1-2)

### 1. Enhanced Semantic Tokens & Aliasing

**Current State**: Basic `$alias` support exists, but needs semantic layer resolution

**Implementation Tasks**:

1. **Create SemanticTokenResolver class**
   ```typescript
   // packages/core/src/SemanticTokenResolver.ts
   export class SemanticTokenResolver {
     static resolveLayers(tokens: DesignTokens): DesignTokens {
       // Resolve semantic tokens like:
       // color.surface.bg → color.gray.100
       // spacing.layout.padding → spacing.lg
     }
     
     static createSemanticLayer(baseTokens: DesignTokens, semanticMap: Record<string, string>): DesignTokens {
       // Create semantic token layer from base tokens
     }
   }
   ```

2. **Enhance TokenParser**
   - Add semantic layer resolution
   - Add semantic token inheritance
   - Add semantic token validation

3. **Documentation**
   - Create semantic tokens guide
   - Add examples for semantic layers
   - Document best practices

**Files to Create/Modify**:
- `packages/core/src/SemanticTokenResolver.ts` (new)
- `packages/core/src/TokenParser.ts` (enhance)
- `packages/core/src/index.ts` (export)
- `documentation/guide/semantic-tokens.md` (new)

---

### 2. Multi-Platform Exporters

**Current State**: Only web formats (CSS, JS, TS, SCSS, JSON)

**Implementation Tasks**:

1. **Create iOS Exporter**
   ```typescript
   // packages/core/src/exporters/IOSExporter.ts
   export class IOSExporter {
     static exportSwift(tokens: DesignTokens, options?: IOSExportOptions): string {
       // Generate Swift/SwiftUI code
     }
     
     static exportSwiftUI(tokens: DesignTokens): string {
       // Generate SwiftUI theme
     }
   }
   ```

2. **Create Android Exporter**
   ```typescript
   // packages/core/src/exporters/AndroidExporter.ts
   export class AndroidExporter {
     static exportKotlin(tokens: DesignTokens): string {
       // Generate Kotlin theme
     }
     
     static exportXML(tokens: DesignTokens): string {
       // Generate XML resources
     }
   }
   ```

3. **Create React Native Exporter**
   ```typescript
   // packages/core/src/exporters/ReactNativeExporter.ts
   export class ReactNativeExporter {
     static export(tokens: DesignTokens): string {
       // Generate React Native theme
     }
   }
   ```

4. **Update TokenExporter**
   - Add platform-specific export methods
   - Add format detection
   - Add platform transformations

**Files to Create/Modify**:
- `packages/core/src/exporters/IOSExporter.ts` (new)
- `packages/core/src/exporters/AndroidExporter.ts` (new)
- `packages/core/src/exporters/ReactNativeExporter.ts` (new)
- `packages/core/src/TokenExporter.ts` (enhance)
- `packages/core/src/index.ts` (export)
- `documentation/guide/multi-platform.md` (new)

---

### 3. Type Generation CLI Command

**Current State**: IDESupport API exists, but no CLI command

**Implementation Tasks**:

1. **Create generate:types command**
   ```typescript
   // packages/cli/src/commands/generate-types.ts
   export function generateTypesCommand(inputFile: string, options: GenerateTypesOptions) {
     // Generate TypeScript declaration files
     // Generate JSON schema
     // Generate VSCode snippets
   }
   ```

2. **Add to CLI**
   ```typescript
   program
     .command('generate:types')
     .description('Generate TypeScript types and IDE support files')
     .option('--output <dir>', 'Output directory')
     .option('--format <format>', 'Output format (ts|json|vscode)')
     .action((options) => generateTypesCommand(options));
   ```

**Files to Create/Modify**:
- `packages/cli/src/commands/generate-types.ts` (new)
- `packages/cli/src/cli.ts` (add command)
- `documentation/cli/commands.md` (document)

---

### 4. Enhanced Tailwind Plugin Format

**Current State**: Basic Tailwind config generation exists

**Implementation Tasks**:

1. **Create Tailwind Plugin**
   ```typescript
   // packages/tailwind/src/plugin.ts
   export function tokiforgePlugin(tokens: DesignTokens) {
     return function(pluginAPI: any) {
       // Register Tailwind plugin
       pluginAPI.addBase({
         // Add CSS variables
       });
       pluginAPI.addComponents({
         // Add component classes
       });
     };
   }
   ```

2. **Update Tailwind Package**
   - Add plugin export
   - Add watch mode
   - Support Tailwind v4

**Files to Create/Modify**:
- `packages/tailwind/src/plugin.ts` (new)
- `packages/tailwind/src/index.ts` (export plugin)
- `documentation/guide/tailwind-plugin.md` (new)

---

## Phase 2: CLI Enhancements (Week 3-4)

### 5. Migrate Command

**Implementation**:
```typescript
// packages/cli/src/commands/migrate.ts
export function migrateCommand(oldFile: string, newFile: string, options: MigrateOptions) {
  // Detect deprecated tokens
  // Generate migration script
  // Update token paths
  // Generate migration report
}
```

### 6. Watch Command

**Implementation**:
```typescript
// packages/cli/src/commands/watch.ts
export function watchCommand(options: WatchOptions) {
  // Watch token files
  // Auto-regenerate exports
  // Hot reload support
}
```

---

## Phase 3: Documentation & Examples

### Priority Documentation Updates

1. **Semantic Tokens Guide**
   - How to create semantic layers
   - Token inheritance patterns
   - Best practices

2. **Multi-Platform Export Guide**
   - iOS setup
   - Android setup
   - React Native setup
   - Cross-platform consistency

3. **Type Generation Guide**
   - CLI usage
   - IDE integration
   - Autocomplete setup

4. **Tailwind Plugin Guide**
   - Installation
   - Configuration
   - Usage examples

---

## Testing Strategy

### Unit Tests
- Semantic token resolution
- Platform exporters
- Type generation
- CLI commands

### Integration Tests
- Cross-platform token consistency
- Figma sync workflows
- CI/CD pipelines

### E2E Tests
- Complete workflows
- Framework integrations
- CLI commands

---

## Migration Guide

### For Existing Users

1. **Semantic Tokens**: No breaking changes, enhanced features
2. **Multi-Platform**: New exporters, existing web exports unchanged
3. **Type Generation**: New CLI command, optional
4. **Tailwind Plugin**: New plugin format, config generation still works

---

## Success Criteria

### Phase 1 Complete When:
- Semantic tokens support semantic layers
- iOS, Android, React Native exporters work
- `generate:types` command generates all formats
- Tailwind plugin works with Tailwind v3/v4

### Phase 2 Complete When:
- `migrate` command handles token migrations
- `watch` command auto-regenerates exports
- All CLI commands are documented

### Phase 3 Complete When:
- All documentation is updated
- Examples exist for all features
- Migration guides are available

---

## Next Steps

1. **Start with Semantic Tokens** (highest impact, existing foundation)
2. **Implement Type Generation CLI** (quick win, high DX value)
3. **Create iOS Exporter** (first mobile platform)
4. **Create Android Exporter** (second mobile platform)
5. **Create React Native Exporter** (third platform)
6. **Enhance Tailwind Plugin** (popular platform)
7. **Add CLI commands** (migrate, watch)
8. **Update documentation** (ongoing)

---

*Last updated: January 2025*

