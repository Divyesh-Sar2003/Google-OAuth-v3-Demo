# 🔒 Security Checklist for GitHub

Before pushing this project to GitHub, ensure all security measures are in place:

## ✅ **REQUIRED CHECKS**

### 1. **Environment Variables**
- [ ] `.env` file exists and contains real credentials
- [ ] `.env` file is listed in `.gitignore`
- [ ] `.env.example` file exists with placeholder values
- [ ] No real API keys or secrets are hardcoded in source code

### 2. **Git Status Check**
Run this command to verify no sensitive files are staged:
```bash
git status
```

**Expected output should NOT include:**
- `.env`
- `node_modules/`
- Any files with real API keys or secrets

### 3. **File Content Verification**
- [ ] `server.js` uses `process.env.VARIABLE_NAME` (not hardcoded values)
- [ ] Session secret uses environment variable or crypto.randomBytes()
- [ ] CORS is properly configured with allowed origins
- [ ] No console.log statements with sensitive data

### 4. **Dependencies Check**
- [ ] `package.json` doesn't contain sensitive information
- [ ] `package-lock.json` is present (will be committed)
- [ ] No sensitive data in any configuration files

## 🚨 **CRITICAL SECURITY ISSUES TO FIX**

### ❌ **NEVER COMMIT:**
- `.env` files with real credentials
- API keys or secrets
- Database connection strings
- Private certificates
- Session secrets

### ✅ **SAFE TO COMMIT:**
- `.env.example` files with placeholders
- Configuration templates
- Documentation
- Source code (without secrets)

## 🔍 **VERIFICATION COMMANDS**

### Check what will be committed:
```bash
git add .
git status
```

### Check for any .env files:
```bash
git ls-files | grep -E "\.env"
```

### Check for hardcoded secrets:
```bash
grep -r "your-secret-key\|your_client_id\|your_client_secret" . --exclude-dir=node_modules
```

## 📋 **FINAL CHECKLIST**

Before pushing to GitHub:

1. [ ] Run `git status` - no sensitive files should appear
2. [ ] Verify `.gitignore` contains `.env` and `node_modules/`
3. [ ] Check that `.env.example` exists with placeholders
4. [ ] Ensure no real credentials are in any source files
5. [ ] Test that the application works with your `.env` file locally
6. [ ] Commit only safe files: `git add . && git commit -m "Initial commit"`
7. [ ] Push to GitHub: `git push origin main`

## 🆘 **IF YOU ACCIDENTALLY COMMIT SENSITIVE DATA**

1. **IMMEDIATELY** revoke/regenerate your Google OAuth credentials
2. Remove the file from git history:
   ```bash
   git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch .env' --prune-empty --tag-name-filter cat -- --all
   ```
3. Force push: `git push origin main --force`
4. Update your `.gitignore` file
5. **NEVER** reuse the same credentials

## 📚 **Additional Resources**

- [GitHub Security Best Practices](https://docs.github.com/en/github/security)
- [OAuth 2.0 Security Considerations](https://tools.ietf.org/html/rfc6819)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

---

**Remember: Security is everyone's responsibility. When in doubt, don't commit it!**
