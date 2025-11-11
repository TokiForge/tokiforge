# TokiForge Roadmap v1.1.1+

## Current Status Analysis

### Already Implemented (v1.1.1)

1. **Semantic Tokens & Aliasing** - Partially implemented
   - `$alias` support for token referencing
   - `semantic.category` for semantic token classification
   - `TokenParser.extractSemanticTokens()` method
   - `TokenParser.validateAliases()` method
   - **Enhancement needed**: Better semantic token layer management

2. **Token Versioning & Governance** - Fully implemented
   - Token version tracking (`version` property)
   - Deprecation flags (`deprecated` property)
   - Migration helpers (`replacedBy`, `migration`)
   - `TokenVersioning` class with full API
   - **Enhancement needed**: Changelog generation, automated migration scripts

3. **Accessibility Checks** - Fully implemented
   - Contrast ratio calculations
   - WCAG AA/AAA compliance checking
   - Motion preference detection
   - Color-blind safety checks
   - `AccessibilityUtils` class
   - **Enhancement needed**: Visual playground integration

4. **Plugin Architecture** - Fully implemented
   - `PluginManager` class
   - Custom exporters, validators, formatters
   - Plugin registration system
   - **Enhancement needed**: Better documentation, community examples

5. **CI/CD Integration** - Fully implemented
   - `CICDValidator` class
   - CLI `validate` command
   - Exit codes for CI pipelines
   - **Enhancement needed**: Visual regression integration, Storybook recipes

6. **Token Analytics** - Fully implemented
   - Usage tracking
   - Bundle impact analysis
   - Unused token detection
   - `TokenAnalytics` class
   - CLI `analytics` command
   - **Enhancement needed**: Better reporting formats, dashboard

7. **Figma Integration** - Implemented
   - `FigmaSync` class
   - `pullFromFigma()` function
   - `pushToFigma()` function
   - `FigmaDiff` class for comparison
   - CLI `figma:diff` command
   - **Enhancement needed**: Tokens Studio integration, Figma plugin

8. **Tailwind Integration** - Implemented
   - `@tokiforge/tailwind` package
   - `generateTailwindConfig()` function
   - CSS variable support
   - CLI `tailwind` command
   - **Enhancement needed**: Tailwind plugin format, watch mode

9. **IDE Support** - Implemented
   - `IDESupport` class
   - Hover information
   - Autocomplete support
   - Token documentation generation
   - **Enhancement needed**: Type generation CLI, VSCode extension

10. **CLI Tooling** - Partially implemented
    - `validate` command
    - `diff` command
    - `analytics` command
    - `figma:diff` command
    - **Enhancement needed**: `migrate`, `watch`, `generate:types` commands

---

## Priority Implementation Plan

### Phase 1: Core Enhancements (High Priority)

#### 1.1 Enhanced Semantic Tokens & Aliasing
**Status**: Partially implemented, needs enhancement  
**Priority**: Critical

**Tasks**:
- [ ] Improve semantic token layer resolution (e.g., `color.surface.bg → color.gray.100`)
- [ ] Add semantic token inheritance system
- [ ] Create semantic token validation
- [ ] Document semantic token patterns
- [ ] Add examples for semantic token layers

**Estimated Effort**: 2-3 days

#### 1.2 Multi-Platform Exporters
**Status**: Missing iOS, Android, React Native exporters  
**Priority**: Critical

**Tasks**:
- [ ] Create iOS exporter (Swift/SwiftUI)
- [ ] Create Android exporter (Kotlin/XML)
- [ ] Create React Native exporter
- [ ] Add platform-specific token transformations
- [ ] Test cross-platform token consistency
- [ ] Document platform exporters

**Estimated Effort**: 5-7 days

#### 1.3 Type Generation & IDE Autocomplete CLI
**Status**: API exists, needs CLI command  
**Priority**: High

**Tasks**:
- [ ] Create `tokiforge generate:types` command
- [ ] Generate TypeScript declaration files
- [ ] Generate JSON schema for validation
- [ ] Add VSCode snippet generation
- [ ] Integrate with IDESupport class
- [ ] Document type generation workflow

**Estimated Effort**: 2-3 days

#### 1.4 Enhanced Tailwind Plugin & Export
**Status**: Basic implementation, needs plugin format  
**Priority**: High

**Tasks**:
- [ ] Create official Tailwind plugin format
- [ ] Add watch mode for Tailwind config generation
- [ ] Support Tailwind v4 syntax
- [ ] Add token-to-utility mapping
- [ ] Create Tailwind preset generator
- [ ] Document Tailwind integration

**Estimated Effort**: 2-3 days

---

### Phase 2: Developer Experience (Medium Priority)

#### 2.1 CLI Tooling Enhancements
**Status**: Partial, needs migrate and watch commands  
**Priority**: High

**Tasks**:
- [ ] Add `tokiforge migrate` command
  - Migrate deprecated tokens
  - Update token paths
  - Generate migration scripts
- [ ] Add `tokiforge watch` command
  - Watch token files for changes
  - Auto-regenerate exports
  - Hot reload support
- [ ] Enhance `tokiforge diff` command
  - Visual diff output
  - Change summary
  - Migration suggestions
- [ ] Add `tokiforge generate:changelog` command
  - Generate token changelogs
  - Version comparison
  - Breaking changes detection

**Estimated Effort**: 4-5 days

#### 2.2 Zero-JS + SSR Friendliness
**Status**: Needs verification and enhancement  
**Priority**: High

**Tasks**:
- [ ] Verify static CSS generation completeness
- [ ] Add SSR-safe token injection
- [ ] Create hydration-safe theme switching
- [ ] Add Next.js/Remix examples
- [ ] Document SSR best practices
- [ ] Test with various SSR frameworks

**Estimated Effort**: 3-4 days

#### 2.3 Enhanced Figma ↔ Code Sync
**Status**: Basic implementation, needs Tokens Studio integration  
**Priority**: High

**Tasks**:
- [ ] Integrate with Tokens Studio API
- [ ] Create Figma plugin for token sync
- [ ] Add bidirectional sync capabilities
- [ ] Support Tokens Studio token format
- [ ] Add conflict resolution
- [ ] Document Figma workflow

**Estimated Effort**: 5-7 days

---

### Phase 3: Visual & Documentation (Medium Priority)

#### 3.1 Visual Playground / Theme Editor
**Status**: Playground exists, needs enhancement  
**Priority**: Medium

**Tasks**:
- [ ] Enhance existing playground package
- [ ] Add theme preview component
- [ ] Add contrast ratio visualizer
- [ ] Add token usage visualization
- [ ] Add theme comparison tool
- [ ] Create hosted playground option
- [ ] Add export/share functionality

**Estimated Effort**: 7-10 days

#### 3.2 CI / Visual Regression Integration
**Status**: Missing Storybook/GitHub Actions recipes  
**Priority**: Medium

**Tasks**:
- [ ] Create Storybook integration guide
- [ ] Create GitHub Actions workflow templates
- [ ] Add visual regression test setup
- [ ] Create token change visualization
- [ ] Add PR preview generation
- [ ] Document CI/CD best practices

**Estimated Effort**: 3-4 days

#### 3.3 Enhanced Usage Analytics
**Status**: Basic implementation, needs better reporting  
**Priority**: Low

**Tasks**:
- [ ] Add HTML report generation
- [ ] Create interactive dashboard
- [ ] Add bundle size visualization
- [ ] Add token usage trends
- [ ] Create analytics export formats
- [ ] Add comparison reports

**Estimated Effort**: 4-5 days

---

### Phase 4: Ecosystem & Community (Lower Priority)

#### 4.1 VSCode Extension
**Status**: API ready, needs extension development  
**Priority**: Medium

**Tasks**:
- [ ] Create VSCode extension project
- [ ] Implement token autocomplete
- [ ] Add hover previews
- [ ] Add token validation
- [ ] Add quick fixes
- [ ] Publish to VSCode marketplace

**Estimated Effort**: 10-14 days

#### 4.2 Community Plugin Examples
**Status**: Plugin system exists, needs examples  
**Priority**: Low

**Tasks**:
- [ ] Create Framer exporter plugin example
- [ ] Create Sketch exporter plugin example
- [ ] Create Adobe XD exporter plugin example
- [ ] Create documentation for plugin development
- [ ] Create plugin template generator

**Estimated Effort**: 5-7 days

---

## Implementation Checklist

### Immediate Next Steps (Week 1-2)

- [ ] **1.1** Enhanced Semantic Tokens & Aliasing
- [ ] **1.3** Type Generation CLI (`generate:types`)
- [ ] **1.4** Enhanced Tailwind Plugin Format
- [ ] **2.1** CLI Enhancements (`migrate`, `watch`)

### Short-term Goals (Month 1)

- [ ] **1.2** Multi-Platform Exporters (iOS, Android, React Native)
- [ ] **2.2** Zero-JS + SSR Enhancements
- [ ] **2.3** Enhanced Figma Integration
- [ ] **3.2** CI/Visual Regression Integration

### Medium-term Goals (Month 2-3)

- [ ] **3.1** Visual Playground Enhancements
- [ ] **3.3** Enhanced Usage Analytics
- [ ] **4.1** VSCode Extension Development

### Long-term Goals (Quarter 2+)

- [ ] **4.2** Community Plugin Examples
- [ ] Advanced token governance features
- [ ] Enterprise features (SSO, team management)
- [ ] Cloud-hosted token registry

---

## Success Metrics

### Developer Experience
- Type generation reduces setup time by 50%
- CLI commands cover 90% of common workflows
- VSCode extension adoption rate > 30%

### Platform Support
- Multi-platform exporters support iOS, Android, React Native
- Zero-JS mode works with all major SSR frameworks
- Figma integration supports Tokens Studio workflow

### Ecosystem Growth
- 10+ community plugins
- 5+ platform exporters
- Active community contributions

---

## Documentation Updates Needed

- [ ] Semantic tokens guide
- [ ] Multi-platform export guide
- [ ] Type generation guide
- [ ] CLI command reference (complete)
- [ ] VSCode extension guide
- [ ] Plugin development guide
- [ ] CI/CD integration guide
- [ ] Visual regression testing guide

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

**Priority areas for contributions**:
1. Multi-platform exporters
2. Plugin examples
3. Documentation improvements
4. VSCode extension
5. Visual playground enhancements

---

## Timeline

- **Q1 2025**: Phase 1 & 2 (Core Enhancements + DX)
- **Q2 2025**: Phase 3 & 4 (Visual Tools + Ecosystem)
- **Q3 2025**: Enterprise features + Cloud services
- **Q4 2025**: Community growth + Platform expansion

---

*Last updated: November 2025*  
*Version: 1.1.1*

