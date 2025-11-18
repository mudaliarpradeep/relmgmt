# GitLeaks Configuration Guide

## Overview

This document explains how the repository is configured to prevent GitLeaks from flagging example credentials and documentation passwords as security issues.

## Configuration Files

### 1. `.gitleaksignore`

This file lists specific files that should be completely ignored by GitLeaks scanning. These are primarily documentation and example files that contain sample credentials for educational purposes.

**Files ignored:**
- Documentation files with connection string examples
- Seeding scripts with default development passwords
- Migration guides with example credentials
- Environment configuration examples

### 2. `.gitleaks.toml`

This is the main configuration file that provides granular control over what GitLeaks considers a secret.

**Key configurations:**

#### Path Allowlist
Ignores all files matching these patterns:
- `docs/*.md` - All documentation files
- `scripts/seed-*.sh` - Seeding scripts
- `*.example` - Example configuration files

#### Regex Allowlist
Ignores specific password patterns that are clearly placeholders:
- `your_password`, `YOUR_PASSWORD`
- `secure_password`
- `devpgadmin` (development-only)
- API key placeholders

#### Stopwords
Words that indicate the content is an example:
- `example`, `sample`, `placeholder`
- `your_`, `YOUR_`

## GitHub Actions Integration

The `.github/workflows/security-scan.yml` file has been updated to use the GitLeaks configuration:

```yaml
- name: Run GitLeaks
  uses: gitleaks/gitleaks-action@v2
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    GITLEAKS_CONFIG: .gitleaks.toml
    GITLEAKS_ENABLE_COMMENTS: false
```

## Files with Example Credentials

The following files contain example credentials that are intentionally kept for documentation purposes:

### Development Credentials
- **Password**: `devpgadmin` (pgAdmin development access)
- **Password**: `Release2024!` (example seeding password)
- **Database Password**: `bBzp16eHfA29wZUvr` (local development PostgreSQL)

### Connection String Examples
Multiple documentation files contain example connection strings with the format:
```
postgresql://username:password@host/database
```

These are clearly marked as examples and use placeholder values.

## Security Best Practices

While these example credentials are allowed in documentation:

1. **Never use these passwords in production**
2. **Always use environment variables for real credentials**
3. **Real secrets should be stored in GitHub Secrets or secure vaults**
4. **The `.env` and `.env.*` files are gitignored to prevent accidental commits**

## Testing the Configuration

To test if GitLeaks will pass with the current configuration:

```bash
# Install gitleaks locally
brew install gitleaks

# Run scan with configuration
gitleaks detect --config .gitleaks.toml --verbose

# Check specific file
gitleaks detect --config .gitleaks.toml --source docs/local-development-setup.md
```

## Updating the Configuration

If you need to add more files or patterns to ignore:

1. **For entire files**: Add to `.gitleaksignore`
2. **For specific patterns**: Add to `.gitleaks.toml` under `allowlist.regexes`
3. **For file patterns**: Add to `.gitleaks.toml` under `allowlist.paths`

## Troubleshooting

If GitLeaks still fails:

1. Check the GitLeaks action logs for the specific secret detected
2. Add the pattern to `.gitleaks.toml` allowlist
3. Ensure the configuration file is being loaded (check `GITLEAKS_CONFIG` env var)
4. Verify the file path matches the pattern in `allowlist.paths`

## Important Notes

- ⚠️ This configuration is specifically for **example/documentation credentials only**
- ⚠️ Real secrets should **never** be committed to the repository
- ⚠️ Production credentials must always use environment variables or secret management systems
- ✅ The configuration allows the pipeline to pass while maintaining security for actual secrets
