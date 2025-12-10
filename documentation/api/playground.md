---
title: API Playground | TokiForge
description: Interactive API playground for TokiForge. Try theme switching, token parsing, and export functions directly in your browser.
---

# API Playground

Try TokiForge APIs interactively in your browser.

<ClientOnly>
  <ApiPlayground />
</ClientOnly>

## Features

- **Live Token Editing** - Edit tokens in JSON format and see changes instantly
- **Multiple Export Formats** - Export to CSS, SCSS, JavaScript, TypeScript, or JSON
- **Theme Switching** - Switch between light and dark themes in real-time
- **Code Preview** - See generated code for all export formats
- **Copy to Clipboard** - Copy generated code with one click

## Usage

1. **Edit Tokens** - Modify the token JSON in the editor
2. **Select Format** - Choose your desired export format
3. **View Output** - See the generated code in the preview panel
4. **Copy Code** - Click the copy button to copy the generated code

## Examples

Try these example tokens:

### Basic Color Tokens

```json
{
  "color": {
    "primary": { "value": "#7C3AED", "type": "color" },
    "secondary": { "value": "#06B6D4", "type": "color" },
    "background": { "value": "#FFFFFF", "type": "color" },
    "text": { "value": "#1F2937", "type": "color" }
  }
}
```

### Complete Token Set

```json
{
  "color": {
    "primary": { "value": "#7C3AED", "type": "color" },
    "secondary": { "value": "#06B6D4", "type": "color" },
    "background": { "value": "#FFFFFF", "type": "color" },
    "text": { "value": "#1F2937", "type": "color" }
  },
  "spacing": {
    "xs": { "value": "4px", "type": "dimension" },
    "sm": { "value": "8px", "type": "dimension" },
    "md": { "value": "16px", "type": "dimension" },
    "lg": { "value": "24px", "type": "dimension" },
    "xl": { "value": "32px", "type": "dimension" }
  },
  "radius": {
    "sm": { "value": "4px", "type": "dimension" },
    "md": { "value": "8px", "type": "dimension" },
    "lg": { "value": "12px", "type": "dimension" }
  },
  "typography": {
    "fontFamily": {
      "sans": { "value": "Inter, sans-serif", "type": "string" }
    },
    "fontSize": {
      "sm": { "value": "14px", "type": "dimension" },
      "base": { "value": "16px", "type": "dimension" },
      "lg": { "value": "18px", "type": "dimension" },
      "xl": { "value": "20px", "type": "dimension" }
    }
  }
}
```

## Tips

- Use valid JSON syntax
- Token values must include a `type` field
- Supported types: `color`, `dimension`, `string`, `number`
- Use `{token.path}` syntax for token references
- The playground validates your tokens automatically

