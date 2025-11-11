# tokiforge-cli

Command-line tool for TokiForge design tokens (v1.1.0).

## Installation

```bash
npm install -g tokiforge-cli
```

Or use with npx:

```bash
npx tokiforge-cli init
```

## Commands

### `tokiforge init`

Initialize TokiForge in your project. Creates `tokens.json` and `tokiforge.config.json`.

```bash
tokiforge init
```

### `tokiforge build`

Build and export tokens to various formats (CSS, JS, TS, SCSS, JSON).

```bash
tokiforge build
```

### `tokiforge dev`

Start a development server with live theme preview.

```bash
tokiforge dev
```

### `tokiforge lint`

Validate token consistency and accessibility.

```bash
tokiforge lint
```

## Configuration

Edit `tokiforge.config.json` to configure:

- Input token file path
- Output file paths for different formats
- Theme definitions
- CSS variable prefix and selector



