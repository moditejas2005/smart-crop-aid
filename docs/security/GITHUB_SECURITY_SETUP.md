# 🔒 GitHub Security Features Setup Guide

## Overview

This guide will help you enable essential security features on your **Smart Crop Aid** GitHub repository to protect against exposed secrets, vulnerable dependencies, and unauthorized changes.

---

## 1. Secret Scanning

**What it does:** Automatically scans your repository for accidentally committed secrets (API keys, passwords, tokens) and alerts you.

### Steps to Enable

1. **Go to your repository** on GitHub
   - URL: `https://github.com/moditejas2005/smart-crop-aid`

2. **Navigate to Settings**
   - Click the **"Settings"** tab (top right of repository page)

3. **Go to Code Security**
   - In the left sidebar, click **"Code security and analysis"**

4. **Enable Secret Scanning**
   - Find **"Secret scanning"** section
   - Click **"Enable"** button
   - ✅ This will scan your repository for known secret patterns

5. **Enable Push Protection** (Recommended)
   - Under Secret scanning, find **"Push protection"**
   - Click **"Enable"**
   - ✅ This prevents you from accidentally pushing secrets

### What Happens Next
- GitHub will scan your entire repository history
- You'll receive alerts if secrets are found
- Future pushes with secrets will be blocked

---

## 2. Dependabot Alerts

**What it does:** Monitors your dependencies (npm packages) for known security vulnerabilities and suggests updates.

### Steps to Enable

1. **Go to Settings → Code security and analysis** (same page as above)

2. **Enable Dependabot Alerts**
   - Find **"Dependabot alerts"** section
   - Click **"Enable"**
   - ✅ You'll receive alerts for vulnerable dependencies

3. **Enable Dependabot Security Updates** (Recommended)
   - Find **"Dependabot security updates"**
   - Click **"Enable"**
   - ✅ Automatically creates PRs to update vulnerable dependencies

4. **Enable Dependabot Version Updates** (Optional)
   - Find **"Dependabot version updates"**
   - Click **"Enable"**
   - Create a `dependabot.yml` file (see below)

### Create `.github/dependabot.yml` (Optional)

```yaml
version: 2
updates:
  # Frontend dependencies
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5

  # Backend dependencies
  - package-ecosystem: "npm"
    directory: "/backend"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
```

---

## 3. Branch Protection Rules

**What it does:** Prevents direct pushes to main branch, requires code reviews, and ensures CI checks pass before merging.

### Steps to Enable

1. **Go to Settings → Branches**
   - In the left sidebar, click **"Branches"**

2. **Add Branch Protection Rule**
   - Click **"Add branch protection rule"** button

3. **Configure Protection for `main` branch**
   - **Branch name pattern**: `main`

4. **Enable These Settings:**

   #### ✅ Require a pull request before merging
   - Check this box
   - **Require approvals**: Set to `1` (or more if you have collaborators)
   - ☑️ Dismiss stale pull request approvals when new commits are pushed
   - ☑️ Require review from Code Owners (if you have CODEOWNERS file)

   #### ✅ Require status checks to pass before merging
   - Check this box
   - Search and select any CI/CD checks you have (e.g., Vercel deployment)
   - ☑️ Require branches to be up to date before merging

   #### ✅ Require conversation resolution before merging
   - Check this box (ensures all review comments are addressed)

   #### ✅ Include administrators
   - Check this box (applies rules to you too - recommended for discipline)

   #### ⚠️ Do not force push
   - Check **"Do not allow force pushes"**

   #### ⚠️ Do not allow deletions
   - Check **"Do not allow deletions"**

5. **Save Changes**
   - Click **"Create"** or **"Save changes"** at the bottom

---

## 4. Additional Security Settings

### A. Enable Private Vulnerability Reporting

1. **Go to Settings → Code security and analysis**
2. Find **"Private vulnerability reporting"**
3. Click **"Enable"**
4. ✅ Allows security researchers to privately report vulnerabilities

### B. Enable Code Scanning (GitHub Advanced Security)

> **Note:** This requires GitHub Advanced Security (free for public repos)

1. **Go to Settings → Code security and analysis**
2. Find **"Code scanning"**
3. Click **"Set up"** → **"Default"**
4. ✅ Automatically scans code for vulnerabilities using CodeQL

### C. Review Security Advisories

1. **Go to Security tab** (top of repository)
2. Review any alerts
3. Click **"View security advisories"**
4. Address any critical issues

---

## 5. Verification Checklist

After enabling all features, verify:

- [ ] **Secret Scanning**: Enabled with push protection
- [ ] **Dependabot Alerts**: Enabled
- [ ] **Dependabot Security Updates**: Enabled
- [ ] **Branch Protection**: Configured for `main` branch
- [ ] **Private Vulnerability Reporting**: Enabled
- [ ] **Code Scanning**: Set up (if available)

---

## 6. Handling Alerts

### When Secret Scanning Finds Secrets

1. **Review the alert** in Security → Secret scanning alerts
2. **Rotate the compromised credential immediately**:
   - Database passwords
   - API keys
   - JWT secrets
   - SMTP passwords
3. **Update the secret** in:
   - Vercel environment variables
   - EAS secrets
   - Any other deployment platforms
4. **Remove from Git history** (see main security guide)
5. **Close the alert** after rotation

### When Dependabot Finds Vulnerabilities

1. **Review the alert** in Security → Dependabot alerts
2. **Check the severity**: Critical > High > Medium > Low
3. **Review the suggested fix**
4. **Options**:
   - Accept Dependabot's automatic PR
   - Manually update the package
   - Dismiss if not applicable (with justification)

---

## 7. Best Practices

### For Solo Development

1. **Create feature branches**:
   ```bash
   git checkout -b feature/new-feature
   ```

2. **Create PR to main**:
   ```bash
   git push origin feature/new-feature
   # Then create PR on GitHub
   ```

3. **Review your own PR** (yes, even solo!)
   - Check the diff
   - Ensure no secrets
   - Verify tests pass

4. **Merge after review**

### For Team Development

1. **Require code reviews** from teammates
2. **Use CODEOWNERS** file to assign reviewers
3. **Set up CI/CD** checks (tests, linting)
4. **Regular security audits**

---

## 8. Quick Reference

| Feature | Location | Benefit |
|---------|----------|---------|
| **Secret Scanning** | Settings → Code security | Detects exposed secrets |
| **Push Protection** | Settings → Code security | Prevents pushing secrets |
| **Dependabot Alerts** | Settings → Code security | Finds vulnerable dependencies |
| **Branch Protection** | Settings → Branches | Requires reviews before merge |
| **Code Scanning** | Settings → Code security | Finds code vulnerabilities |

---

## 9. Troubleshooting

### "I can't push to main anymore"
✅ **This is working as intended!** Create a feature branch and PR instead.

### "Dependabot created too many PRs"
- Adjust `open-pull-requests-limit` in `dependabot.yml`
- Or disable version updates, keep only security updates

### "Secret scanning found old secrets"
- Rotate the secrets immediately
- Remove from Git history
- Update deployment platforms
- Close the alert

---

## 10. Resources

- [GitHub Secret Scanning Docs](https://docs.github.com/en/code-security/secret-scanning)
- [Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)
- [Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches)

---

**Last Updated:** February 2026

**Status:** Ready to implement ✅
