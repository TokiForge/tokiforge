---
title: Multi-Platform Exporters | Guide
description: Export design tokens to iOS (Swift), Android (Kotlin/XML), React Native, and other platforms. Cross-platform token consistency and platform-specific transformations.
---

# Multi-Platform Exporters

TokiForge provides native exporters for iOS, Android, and React Native, enabling seamless token integration across mobile platforms.

## Supported Platforms

- **iOS**: Swift & SwiftUI formats
- **Android**: Kotlin & XML resource formats
- **React Native**: TypeScript & JavaScript with Expo/CLI support

## iOS Exporter

Export design tokens to iOS Swift code with automatic value conversion.

### Swift Format

```typescript
import { IOSExporter } from "@tokiforge/core";

const tokens = {
  colors: {
    primary: { value: "#007AFF", type: "color" },
    secondary: { value: "#5AC8FA", type: "color" },
  },
  typography: {
    heading: {
      value: { fontSize: 28, fontWeight: "bold", lineHeight: 1.4 },
      type: "typography",
    },
  },
  spacing: {
    sm: { value: 8, type: "spacing" },
    md: { value: 16, type: "spacing" },
  },
};

const swift = IOSExporter.export(tokens, {
  format: "swift",
  className: "DesignTokens",
  colorFormat: "hex",
});

console.log(swift);
// import UIKit
//
// public enum DesignTokens {
//   // MARK: - Colors
//   public static let colorsPrimary = UIColor(hex: "#007AFF")
//   public static let colorsSecondary = UIColor(hex: "#5AC8FA")
//
//   // MARK: - Typography
//   public static let typographyHeading: UIFont = UIFont.systemFont(ofSize: 28, weight: .bold)
//
//   // MARK: - Spacing
//   public static let spacingSm: CGFloat = 8
//   public static let spacingMd: CGFloat = 16
// }
```

### Color Formats

Choose how colors are formatted in the output:

```typescript
// Hex format (default)
IOSExporter.export(tokens, { colorFormat: "hex" });
// UIColor(hex: "#007AFF")

// RGB format
IOSExporter.export(tokens, { colorFormat: "rgb" });
// UIColor(red: 0.004, green: 0.478, blue: 1.000, alpha: 1.0)

// UIColor initializer
IOSExporter.export(tokens, { colorFormat: "uicolor" });
// UIColor(red: 0/255.0, green: 122/255.0, blue: 255/255.0, alpha: 1.0)
```

### SwiftUI Format

Generate a SwiftUI-compatible environment value:

```typescript
const swiftui = IOSExporter.export(tokens, {
  format: "swiftui",
  className: "DesignTokens",
});

// struct DesignTokens: EnvironmentKey {
//   static let defaultValue = Self()
//
//   var colorsPrimary: Color = Color(red: 0.004, green: 0.478, blue: 1.000)
//   var colorsSecondary: Color = Color(red: 0.353, green: 0.784, blue: 0.980)
// }
//
// extension EnvironmentValues {
//   var designTokens: DesignTokens {
//     get { self[DesignTokens.self] }
//     set { self[DesignTokens.self] = newValue }
//   }
// }
```

### Using in iOS App

```swift
import UIKit

// Apply color tokens
view.backgroundColor = DesignTokens.colorsPrimary
label.font = DesignTokens.typographyHeading

// Adjust spacing
stackView.spacing = DesignTokens.spacingMd
```

## Android Exporter

Export design tokens to Android with Kotlin objects and XML resources.

### Kotlin Format

```typescript
import { AndroidExporter } from "@tokiforge/core";

const kotlin = AndroidExporter.export(tokens, {
  format: "kotlin",
  packageName: "com.myapp.design",
  objectName: "DesignTokens",
  colorFormat: "hex",
});

// package com.myapp.design
//
// import androidx.compose.ui.graphics.Color
// import androidx.compose.ui.unit.sp
// import androidx.compose.ui.unit.dp
//
// object DesignTokens {
//   // Colors
//   val colors_primary = Color(0xFF007AFF)
//   val colors_secondary = Color(0xFF5AC8FA)
//
//   // Typography
//   val typography_heading = TextStyle(fontSize = 28.sp)
//
//   // Spacing
//   val spacing_sm = 8.dp
//   val spacing_md = 16.dp
// }
```

### XML Format

Generate Android XML resources:

```typescript
const xml = AndroidExporter.export(tokens, {
  format: "xml",
  colorFormat: "hex",
});

// <?xml version="1.0" encoding="utf-8"?>
// <resources>
//   <!-- Colors -->
//   <color name="colors_primary">#007AFF</color>
//   <color name="colors_secondary">#5AC8FA</color>
//
//   <!-- Dimensions -->
//   <dimen name="spacing_sm">8dp</dimen>
//   <dimen name="spacing_md">16dp</dimen>
//
//   <!-- Typography Styles -->
//   <!-- Style: typography_heading defined in styles.xml -->
// </resources>
```

### Color Formats

```typescript
// Hex format (default)
AndroidExporter.export(tokens, { colorFormat: "hex" });
// #007AFF

// ARGB format (for resource references)
AndroidExporter.export(tokens, { colorFormat: "argb" });
// #FF007AFF

// Integer format
AndroidExporter.export(tokens, { colorFormat: "int" });
// -16746047
```

### Using in Android App

**In Compose:**

```kotlin
import androidx.compose.material3.Surface
import com.myapp.design.DesignTokens

Surface(
  color = DesignTokens.colors_primary,
  modifier = Modifier
    .padding(DesignTokens.spacing_md.dp)
) {
  Text(
    "Hello Design System",
    fontSize = DesignTokens.typography_heading.fontSize
  )
}
```

**In XML layouts:**

```xml
<LinearLayout
  android:background="@color/colors_primary"
  android:padding="@dimen/spacing_md">
  <TextView
    android:textSize="@dimen/typography_heading_size"
    android:text="Hello Design System" />
</LinearLayout>
```

## React Native Exporter

Export design tokens for React Native with TypeScript support.

### TypeScript Format

```typescript
import { ReactNativeExporter } from "@tokiforge/core";

const ts = ReactNativeExporter.export(tokens, {
  format: "typescript",
  includeTheme: true,
});

// import { StyleSheet } from 'react-native';
//
// export interface Theme {
//   colors: {
//     colorsPrimary: string;
//     colorsSecondary: string;
//   };
//   typography: {
//     typographyHeading: TextStyle;
//   };
//   spacing: {
//     spacingSm: number;
//     spacingMd: number;
//   };
// }
//
// export const tokens = {
//   colors: {
//     colorsPrimary: '#007AFF',
//     colorsSecondary: '#5AC8FA',
//   },
//   typography: {
//     typographyHeading: { fontSize: 28, fontWeight: 'bold' },
//   },
//   spacing: {
//     spacingSm: 8,
//     spacingMd: 16,
//   },
// } as const;
//
// export type Tokens = typeof tokens;
//
// export function useTokens() {
//   return tokens;
// }
```

### JavaScript Format

```typescript
const js = ReactNativeExporter.export(tokens, {
  format: "javascript",
});

// import { StyleSheet } from 'react-native';
//
// export const tokens = {
//   colors: {
//     colorsPrimary: '#007AFF',
//     colorsSecondary: '#5AC8FA',
//   },
//   typography: {
//     typographyHeading: { fontSize: 28, fontWeight: 'bold' },
//   },
//   spacing: {
//     spacingSm: 8,
//     spacingMd: 16,
//   },
// };
//
// export function useTokens() {
//   return tokens;
// }
```

### Using in React Native

```jsx
import { useTokens } from "./tokens";
import { View, Text, StyleSheet } from "react-native";

export function App() {
  const tokens = useTokens();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: tokens.colors.colorsPrimary },
      ]}
    >
      <Text style={[styles.heading, tokens.typography.typographyHeading]}>
        Hello Design System
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16, // Use tokens.spacing.spacingMd
  },
  heading: {
    marginBottom: 16,
  },
});
```

## Platform-Specific Transformations

### Color Value Normalization

All exporters automatically convert hex colors to platform-appropriate formats:

- **iOS**: `UIColor` or `Color` structures
- **Android**: XML color resources or `Color` composables
- **React Native**: Hex strings or RGB values

### Typography Handling

```typescript
// Semantic token with typography
const typographyTokens = {
  heading: {
    value: {
      fontSize: 28,
      fontWeight: "bold",
      lineHeight: 1.4,
      fontFamily: "Inter",
    },
  },
};

// iOS: Converts to UIFont.systemFont(ofSize:, weight:)
// Android: Converts to TextStyle with fontSize in sp
// React Native: Plain object with fontSize in numeric format
```

### Spacing/Sizing Units

Different platforms have different unit conventions:

- **iOS**: `CGFloat` (points)
- **Android**: `dp` (device-independent pixels)
- **React Native**: Numeric values (unspecified unit, platform-dependent)

```typescript
// Input: { value: 16 }
// iOS: CGFloat = 16
// Android: 16.dp
// React Native: spacingMd: 16
```

## Best Practices

### 1. Consistent Naming

Use consistent naming conventions across platforms:

```typescript
// ✅ Good
{
  colors: {
    primary: { ... },
    secondary: { ... }
  }
}

// ❌ Avoid platform-specific names
{
  colors: {
    primaryIOS: { ... },
    primaryAndroid: { ... }
  }
}
```

### 2. Token Organization

Structure tokens logically for platform generators:

```typescript
{
  colors: { /* iOS: Color tokens */ },
  typography: { /* Font tokens */ },
  spacing: { /* Dimension tokens */ },
  sizing: { /* Size tokens */ },
  borders: { /* Border definitions */ }
}
```

### 3. Export to Version Control

Save exported tokens in your platform repositories:

```bash
# Generate iOS tokens
npx tokiforge export --platform ios --output ios/DesignTokens.swift

# Generate Android tokens
npx tokiforge export --platform android --output android/design/Tokens.kt

# Generate React Native tokens
npx tokiforge export --platform react-native --output rn/tokens.ts
```

### 4. Update Strategies

Keep platform tokens in sync with your design system:

```typescript
// Regenerate when design system changes
const updateTokens = async () => {
  const tokens = await loadDesignTokens();

  const ios = IOSExporter.export(tokens, { format: "swift" });
  const android = AndroidExporter.export(tokens, { format: "kotlin" });
  const rn = ReactNativeExporter.export(tokens, { format: "typescript" });

  // Write to platform directories
  saveToFile("ios/DesignTokens.swift", ios);
  saveToFile("android/DesignTokens.kt", android);
  saveToFile("rn/tokens.ts", rn);
};
```

### 5. Validation

Always validate exported tokens after generation:

```typescript
// iOS: Verify Swift syntax
// Android: Check XML validity and resource naming
// React Native: Validate TypeScript compilation

import { validateTokenExport } from "@tokiforge/core";

const isValid = validateTokenExport(ios, "ios");
if (!isValid) {
  throw new Error("Invalid iOS token export");
}
```

## API Reference

### IOSExporter

```typescript
interface IOSExportOptions {
  format?: 'swift' | 'swiftui'; // Default: 'swift'
  className?: string; // Default: 'DesignTokens'
  prefix?: string;
  colorFormat?: 'hex' | 'rgb' | 'uicolor'; // Default: 'hex'
}

IOSExporter.export(tokens: DesignTokens, options: IOSExportOptions): string
```

### AndroidExporter

```typescript
interface AndroidExportOptions {
  format?: 'kotlin' | 'xml'; // Default: 'kotlin'
  packageName?: string; // Default: 'com.example.tokens'
  objectName?: string; // Default: 'DesignTokens'
  colorFormat?: 'hex' | 'int' | 'argb'; // Default: 'hex'
}

AndroidExporter.export(tokens: DesignTokens, options: AndroidExportOptions): string
```

### ReactNativeExporter

```typescript
interface ReactNativeExportOptions {
  format?: 'typescript' | 'javascript'; // Default: 'typescript'
  includeTheme?: boolean; // Default: true
  colorFormat?: 'hex' | 'rgb'; // Default: 'hex'
}

ReactNativeExporter.export(tokens: DesignTokens, options: ReactNativeExportOptions): string
```

## See Also

- [Semantic Tokens](./semantic-tokens.md)
- [Token Exporter](../api/token-exporter.md)
- [Design Systems Guide](./design-tokens.md)
