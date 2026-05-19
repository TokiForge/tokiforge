import { IOSExporter, type IOSExportOptions } from './ios-exporter';
import { AndroidExporter, type AndroidExportOptions } from './android-exporter';
import { ReactNativeExporter, type ReactNativeExportOptions } from './react-native-exporter';
import type { DesignTokens } from '../types';

export { IOSExporter, type IOSExportOptions };
export { AndroidExporter, type AndroidExportOptions };
export { ReactNativeExporter, type ReactNativeExportOptions };

export interface PlatformExporterOptions {
  platform: 'ios' | 'android' | 'react-native';
  options?: IOSExportOptions | AndroidExportOptions | ReactNativeExportOptions;
}

/**
 * Universal platform exporter
 */
export class PlatformExporter {
  static export(
    tokens: DesignTokens,
    platform: 'ios' | 'android' | 'react-native',
    options: IOSExportOptions | AndroidExportOptions | ReactNativeExportOptions = {}
  ): string {
    switch (platform) {
      case 'ios':
        return IOSExporter.export(tokens, options as IOSExportOptions);
      case 'android':
        return AndroidExporter.export(tokens, options as AndroidExportOptions);
      case 'react-native':
        return ReactNativeExporter.export(tokens, options as ReactNativeExportOptions);
      default: {
        const exhaust: never = platform;
        throw new Error(`Unsupported platform: ${exhaust}`);
      }
    }
  }
}
