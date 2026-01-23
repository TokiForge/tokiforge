export { IOSExporter, type IOSExportOptions } from './ios-exporter';
export { AndroidExporter, type AndroidExportOptions } from './android-exporter';
export { ReactNativeExporter, type ReactNativeExportOptions } from './react-native-exporter';

export interface PlatformExporterOptions {
  platform: 'ios' | 'android' | 'react-native';
  options?: any;
}

/**
 * Universal platform exporter
 */
export class PlatformExporter {
  static export(tokens: any, platform: 'ios' | 'android' | 'react-native', options: any = {}) {
    switch (platform) {
      case 'ios':
        return new (require('./ios-exporter')).IOSExporter().export(tokens, options);
      case 'android':
        return new (require('./android-exporter')).AndroidExporter().export(tokens, options);
      case 'react-native':
        return new (require('./react-native-exporter')).ReactNativeExporter().export(tokens, options);
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }
}
