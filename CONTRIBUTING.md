# Contributing to TokiForge

Thank you for your interest in contributing to TokiForge (v1.2.0)! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/TokiForge.git`
3. Install dependencies: `npm install`
4. Create a feature branch: `git checkout -b feat/your-feature-name`

## Development

### Building

```bash
# Build all packages (including playground and docs)
npm run build:all

# Or build core + framework packages only
npm run build
```

### Running Examples

```bash
cd examples/react-example
npm install
npm run dev
```

### Testing

```bash
npm test
```

## Code Style

- Use TypeScript for all new code
- Follow the existing code style
- Write meaningful commit messages
- Add comments for complex logic

## Submitting Changes

1. Make sure your code builds: `npm run build`
2. Run linting: `npm run lint`
3. Commit your changes: `git commit -m "feat: description of changes"`
4. Push to your fork: `git push origin feat/your-feature-name`
5. Open a Pull Request

## Pull Request Guidelines

- Provide a clear description of changes
- Include examples if adding new features
- Update documentation as needed
- Ensure all tests pass

## Questions?

Feel free to open an issue for questions or discussions!

