// Stub for Node.js 'yaml' module for browser compatibility
export function parse(content: string) {
  // Basic JSON fallback for browser environments
  // For full YAML support in browser, use a dedicated YAML parser library
  try {
    return JSON.parse(content);
  } catch {
    throw new Error('YAML parsing is not fully supported in browser. Use JSON or pre-parse on server.');
  }
}

export default {
  parse,
};

