# GitHub Security Features - Quick Setup

Follow these steps to secure your public repository:

## 1️⃣ Secret Scanning (5 minutes)

1. Go to: `https://github.com/moditejas2005/smart-crop-aid/settings/security_analysis`
2. Enable **"Secret scanning"**
3. Enable **"Push protection"**

✅ **Done!** GitHub will now scan for exposed secrets.

---

## 2️⃣ Dependabot Alerts (2 minutes)

1. Same page as above
2. Enable **"Dependabot alerts"**
3. Enable **"Dependabot security updates"**

✅ **Done!** You'll get alerts for vulnerable dependencies.

---

## 3️⃣ Branch Protection (5 minutes)

1. Go to: `https://github.com/moditejas2005/smart-crop-aid/settings/branches`
2. Click **"Add branch protection rule"**
3. Branch name pattern: `main`
4. Enable:
   - ☑️ Require a pull request before merging
   - ☑️ Require approvals: `1`
   - ☑️ Do not allow force pushes
   - ☑️ Do not allow deletions
5. Click **"Create"**

✅ **Done!** Main branch is now protected.

---

## Total Time: ~12 minutes

For detailed instructions, see [GITHUB_SECURITY_SETUP.md](./GITHUB_SECURITY_SETUP.md)
