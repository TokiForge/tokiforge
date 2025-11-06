# Theme Approaches Comparison

This example demonstrates two different approaches to theming in Vue:

## 1. Simple CSS Approach (Current: `App.vue`)

**Files:**
- `src/themes/light.css` - Static CSS with `body.theme-light` selector
- `src/themes/dark.css` - Static CSS with `body.theme-dark` selector  
- `src/composables/useTheme.ts` - Simple composable that manages body classes

**How it works:**
- Design tokens are defined in static CSS files
- Tokens are scoped by theme class on the body element
- Composable just adds/removes `theme-light` or `theme-dark` classes
- CSS variables automatically switch based on body class

**Pros:**
- ✅ Simple and straightforward
- ✅ No JavaScript runtime overhead
- ✅ Works with any build tool
- ✅ Easy to understand and maintain
- ✅ CSS-only, no JS injection

**Cons:**
- ❌ Less flexible (can't dynamically generate themes)
- ❌ No token parsing/reference expansion
- ❌ Manual CSS file management
- ❌ Can't use advanced TokiForge features

## 2. TokiForge Plugin - Dynamic Mode (`App.tokiforge.vue`)

**Files:**
- Uses `@tokiforge/vue` package
- Uses `ThemeRuntime` from `@tokiforge/core`

**How it works:**
- JavaScript runtime injects CSS variables into a `<style>` tag
- Tokens are defined in JavaScript/JSON
- Runtime dynamically updates CSS variables when theme changes
- Supports token references, parsing, and advanced features

**Pros:**
- ✅ Dynamic theme generation
- ✅ Token reference expansion (`{color.primary}`)
- ✅ Token parsing from JSON/YAML
- ✅ More features (system theme detection, etc.)
- ✅ Can export to multiple formats
- ✅ Type-safe token access

**Cons:**
- ❌ Requires JavaScript runtime
- ❌ Slightly more complex setup
- ❌ Adds bundle size (~3KB gzipped)
- ❌ CSS variables injected via JS

## 3. Enhanced TokiForge Plugin - Static Mode (`App.enhanced.vue`) ⭐ **BEST**

**Files:**
- Uses `@tokiforge/vue` package with static mode
- Can generate CSS files at build time

**How it works:**
- Uses body classes (like simple CSS approach) for zero JS overhead
- But with all TokiForge features (token parsing, references, etc.)
- Automatic localStorage persistence
- System theme detection built-in
- Can generate CSS files at build time

**Pros:**
- ✅ **Best of both worlds**: Simple CSS performance + plugin features
- ✅ Zero JavaScript overhead (static mode)
- ✅ Token parsing and reference expansion
- ✅ Automatic localStorage persistence
- ✅ System theme detection
- ✅ CSS generation utilities
- ✅ Body class management (better CSS cascade)
- ✅ Type-safe and developer-friendly

**Cons:**
- ❌ Slightly more setup than simple CSS (but worth it!)

## Which Should You Use?

**Use Simple CSS Approach when:**
- You want the absolute simplest solution
- You don't need token parsing/references
- You're okay with manual CSS file management
- You don't need advanced features

**Use Enhanced TokiForge Plugin (Static Mode) ⭐ RECOMMENDED:**
- You want best performance (zero JS overhead)
- You need token parsing/references
- You want automatic localStorage persistence
- You want system theme detection
- You want CSS generation utilities
- You're building a design system
- **This is the best option for most projects!**

**Use TokiForge Plugin (Dynamic Mode) when:**
- You need truly dynamic theme generation at runtime
- You're building themes programmatically
- You need runtime theme injection

## Recommendation

**Use the Enhanced TokiForge Plugin in static mode!** It gives you:
- ✅ Simple CSS performance (body classes, zero JS)
- ✅ All plugin features (token parsing, references)
- ✅ Better DX (auto-persistence, system theme)
- ✅ More flexibility (static or dynamic)

It's the best of both worlds! 🎉

