export class TokiForgeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TokiForgeError';
    Object.setPrototypeOf(this, TokiForgeError.prototype);
  }
}

export class TokenParseError extends TokiForgeError {
  constructor(message: string, public readonly filePath?: string) {
    super(message);
    this.name = 'TokenParseError';
    Object.setPrototypeOf(this, TokenParseError.prototype);
  }
}

export class TokenValidationError extends TokiForgeError {
  constructor(message: string, public readonly errors: string[] = []) {
    super(message);
    this.name = 'TokenValidationError';
    Object.setPrototypeOf(this, TokenValidationError.prototype);
  }
}

export class ThemeNotFoundError extends TokiForgeError {
  constructor(themeName: string, public readonly availableThemes: string[] = []) {
    super(`Theme "${themeName}" not found. Available themes: ${availableThemes.join(', ')}`);
    this.name = 'ThemeNotFoundError';
    Object.setPrototypeOf(this, ThemeNotFoundError.prototype);
  }
}

export class ColorConversionError extends TokiForgeError {
  constructor(message: string, public readonly color?: string) {
    super(message);
    this.name = 'ColorConversionError';
    Object.setPrototypeOf(this, ColorConversionError.prototype);
  }
}

