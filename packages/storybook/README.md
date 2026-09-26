# @tokiforge/storybook

Storybook addon for TokiForge design tokens (v2.4.0). View and switch themes directly in Storybook.

## Installation

```bash
npm install @tokiforge/storybook@^2.4.0 @tokiforge/core@^2.4.0
```

## Usage

### 1. Register the addon in `.storybook/main.js`

```js
export default {
  addons: [
    "@tokiforge/storybook",
    // ... other addons
  ],
};
```

You can also import the register helper:

```js
import { register } from "@tokiforge/storybook";
```

### 2. Configure in `.storybook/preview.js`

```js
import { withTokiForge, tokiforgeParameters } from "@tokiforge/storybook";
import { themeConfig } from "../src/themes";

export const decorators = [
  withTokiForge({
    config: themeConfig,
    enableThemeSwitcher: true,
    enableTokenViewer: true,
  }),
];

export const parameters = {
  ...tokiforgeParameters({
    config: themeConfig,
    enableThemeSwitcher: true,
    enableTokenViewer: true,
  }),
};
```

## Features

- Theme switcher in toolbar
- Token viewer in addon panel
- Official `register` export (v2.4.0)
- Automatic theme initialization
- Theme change events
- TypeScript support

## License

AGPL-3.0
