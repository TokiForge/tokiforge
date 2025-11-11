# TokiForge Svelte Example

This example demonstrates how to use TokiForge with Svelte.

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

**Important:** The example uses local packages from the monorepo. You need to build the packages first.

**Step 1: Build the packages**

From the repository root:

```bash
npm run build
```

This builds `@tokiforge/core` and `@tokiforge/svelte` packages.

**Step 2: Install example dependencies**

```bash
cd examples/svelte-example
npm install
```

The example uses `file:` protocol to link to the local packages, so they must be built first.

### Development

```bash
# Start dev server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
# Build for production
npm run build
```

### Preview

```bash
# Preview production build
npm run preview
```

## Project Structure

```
svelte-example/
├── src/
│   ├── App.svelte       # Main component
│   ├── tokens.json      # Design tokens
│   └── main.ts          # Entry point
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```



## Improvements

- Enhanced documentation
- Better examples
- Updated usage guide
