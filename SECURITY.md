# Security Policy

## Supported Versions

We actively support the following versions of TokiForge with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security vulnerability, please report it responsibly.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via one of the following methods:

1. **Email (Preferred):**
   - Send details to: [security@tokiforge.dev](mailto:security@tokiforge.dev)
   - If no security email is configured, use: [GitHub Security Advisory](https://github.com/TokiForge/tokiforge/security/advisories/new)

2. **GitHub Security Advisory:**
   - Go to: https://github.com/TokiForge/tokiforge/security/advisories/new
   - Click "Report a vulnerability"
   - Fill out the form with details

### What to Include

When reporting a vulnerability, please include:

- **Type of vulnerability** (e.g., XSS, injection, authentication bypass)
- **Affected package/component** (e.g., `@tokiforge/core`, `@tokiforge/react`, CLI)
- **Steps to reproduce** the vulnerability
- **Potential impact** (e.g., data exposure, unauthorized access)
- **Suggested fix** (if you have one)
- **Your contact information** for follow-up questions

### What to Expect

- **Initial Response:** Within 48 hours
- **Status Update:** Within 7 days
- **Fix Timeline:** Depends on severity (see below)
- **Disclosure:** After fix is released (coordinated disclosure)

## Security Response Timeline

| Severity | Response Time | Fix Time |
|----------|--------------|----------|
| **Critical** | 24 hours | 7 days |
| **High** | 48 hours | 14 days |
| **Medium** | 7 days | 30 days |
| **Low** | 14 days | 90 days |

## Severity Levels

### Critical
- Remote code execution
- Authentication bypass
- Data exposure of sensitive information
- SQL injection
- Cross-site scripting (XSS) with significant impact

### High
- Privilege escalation
- Significant data exposure
- Denial of service (DoS)
- Cross-site request forgery (CSRF) with significant impact

### Medium
- Information disclosure
- Limited DoS
- CSRF with limited impact
- Security misconfigurations

### Low
- Best practices violations
- Minor information leaks
- Limited security impact

## Disclosure Policy

We follow a **coordinated disclosure** process:

1. **Report:** Security issue is reported privately
2. **Investigation:** We investigate and confirm the vulnerability
3. **Fix Development:** We develop and test a fix
4. **Release:** We release the fix in a new version
5. **Disclosure:** We publicly disclose the vulnerability (typically after users have had time to update)

## Security Best Practices

### For Users

1. **Keep dependencies updated:**
   ```bash
   npm update @tokiforge/core @tokiforge/react
   ```

2. **Use latest versions:**
   - Regularly check for updates
   - Review changelogs for security fixes

3. **Validate input:**
   - Always validate token files before parsing
   - Use TypeScript for type safety

4. **Review dependencies:**
   - Regularly audit dependencies: `npm audit`
   - Use `npm audit fix` when possible

5. **Secure token files:**
   - Don't commit sensitive tokens to version control
   - Use environment variables for secrets
   - Implement proper access controls

### For Developers

1. **Follow secure coding practices:**
   - Validate all inputs
   - Sanitize user-provided data
   - Use parameterized queries (if applicable)
   - Implement proper error handling

2. **Regular security audits:**
   ```bash
   npm audit
   npm audit fix
   ```

3. **Dependency updates:**
   - Keep dependencies up to date
   - Review changelogs for security patches
   - Remove unused dependencies

4. **Code review:**
   - All code changes should be reviewed
   - Security-sensitive code requires extra scrutiny

## Known Security Issues

### Currently None

No known security vulnerabilities at this time.

If you discover a security issue, please report it using the methods above.

## Security Updates

Security updates will be:
- Released as patch versions (e.g., `1.0.0` → `1.0.1`)
- Documented in [CHANGELOG.md](./CHANGELOG.md) (if exists)
- Announced via GitHub releases
- Tagged with `security` label

## Dependencies

TokiForge uses the following key dependencies:

- **yaml** - YAML parsing (used in core)
- **commander** - CLI command parsing
- **chalk** - Terminal styling
- **inquirer** - Interactive prompts
- **chokidar** - File watching

We monitor these dependencies for security updates and update them regularly.

## Security Checklist for Contributors

When contributing code, please ensure:

- [ ] No hardcoded secrets or credentials
- [ ] Input validation is implemented
- [ ] Error messages don't leak sensitive information
- [ ] Dependencies are up to date
- [ ] No known security vulnerabilities in dependencies
- [ ] Code follows security best practices
- [ ] Tests cover security-critical paths

## Contact

For security-related questions or concerns:

- **Security Issues:** [security@tokiforge.dev](mailto:security@tokiforge.dev) or [GitHub Security Advisory](https://github.com/TokiForge/tokiforge/security/advisories/new)
- **General Questions:** [GitHub Discussions](https://github.com/TokiForge/tokiforge/discussions)
- **Bug Reports:** [GitHub Issues](https://github.com/TokiForge/tokiforge/issues)

## Acknowledgments

We appreciate responsible disclosure of security vulnerabilities. Contributors who report security issues will be:

- Acknowledged (if desired) in security advisories
- Listed in project documentation (if desired)
- Credited for helping improve TokiForge security

## License

This security policy is provided as-is. For legal matters, please refer to the [LICENSE](./LICENSE) file.

---

**Last Updated:** 2025-11-07

**Policy Version:** 1.0

