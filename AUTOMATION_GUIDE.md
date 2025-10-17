# 🤖 EatsGram Automation Guide

यह guide आपको बताता है कि कैसे EatsGram repository automatically upstream (eatsgram) से updates sync करता है।

## 📋 Overview

EatsGram repository में **3 automated GitHub Actions workflows** हैं जो:

1. **Original eatsgram repository से नई updates pull करते हैं**
2. **सभी references को automatically rebrand करते हैं**
3. **Sensitive files को remove करते हैं**

---

## 🔄 Workflows Explained

### 1️⃣ **Sync with Upstream Repository** (`sync-upstream.yml`)

**कब चलता है:**
- हर दिन 2 AM UTC (भारतीय समय में 7:30 AM)
- Manual trigger से भी चला सकते हैं

**क्या करता है:**
```
Original eatsgram repo → Fetch latest changes
                    ↓
                Merge करता है
                    ↓
            eatsgram → EatsGram replace करता है
                    ↓
        Sensitive files remove करता है
                    ↓
            EatsGram repo में push करता है
```

**Example:**
```
eatsgram-multivendor-admin → EatsGram-admin
eatsgram → eatsgram
EatsGram → EatsGram
```

---

### 2️⃣ **Auto Rebrand to EatsGram** (`auto-rebrand.yml`)

**कब चलता है:**
- हर push या pull request पर

**क्या करता है:**
- सभी code files में `eatsgram` को `eatsgram` से replace करता है
- Directory names को rename करता है
- Automatically commit करता है

---

### 3️⃣ **Cleanup Sensitive Files** (`cleanup-sensitive-files.yml`)

**कब चलता है:**
- हर push या pull request पर

**क्या करता है:**
- LICENSE files को remove करता है
- Google service account files को delete करता है
- .env files को remove करता है
- Secret patterns को scan करता है

---

## 🚀 Manual Trigger करना

### GitHub UI से:

1. Repository के **Actions** tab पर जाएं
2. Left sidebar में workflow select करें
3. **"Run workflow"** button दबाएं
4. **Branch** select करें (usually `main`)
5. **"Run workflow"** confirm करें

### Command Line से:

```bash
# Sync upstream को trigger करने के लिए
gh workflow run sync-upstream.yml --ref main

# Auto rebrand को trigger करने के लिए
gh workflow run auto-rebrand.yml --ref main

# Cleanup को trigger करने के लिए
gh workflow run cleanup-sensitive-files.yml --ref main
```

---

## 📊 Workflow Status Check करना

### GitHub UI में:

1. **Actions** tab खोलें
2. Workflow का नाम select करें
3. Latest run को देखें
4. Status check करें:
   - ✅ **Success** - सभी changes apply हुए
   - ❌ **Failed** - कोई error आया
   - ⏳ **In Progress** - Workflow चल रहा है

### Logs देखना:

1. Workflow run को click करें
2. **"Sync with Upstream Repository"** job को expand करें
3. हर step के logs देखें

---

## 🔧 Configuration

### Workflow Schedule:

```yaml
# sync-upstream.yml में
schedule:
  - cron: '0 2 * * *'  # हर दिन 2 AM UTC
```

**UTC से भारतीय समय में convert करने के लिए:**
- UTC 2 AM = IST 7:30 AM (UTC+5:30)

### अगर अलग समय चाहिए:

```yaml
# Example: हर 6 घंटे में
schedule:
  - cron: '0 */6 * * *'

# Example: हर सोमवार को 10 AM UTC
schedule:
  - cron: '0 10 * * 1'
```

---

## ⚙️ कैसे काम करता है - Step by Step

### Step 1: Upstream Fetch
```bash
git remote add upstream https://github.com/eatsgram/eatsgram.git
git fetch upstream main
```

### Step 2: Merge करना
```bash
git merge upstream/main --allow-unrelated-histories
```

### Step 3: Rebranding
```bash
# सभी files में replace करना
find . -type f -exec sed -i 's/eatsgram/eatsgram/g; s/EatsGram/EatsGram/g' {} \;

# Directories rename करना
mv eatsgram-multivendor-admin EatsGram-admin
```

### Step 4: Cleanup
```bash
# Sensitive files remove करना
find . -name "*service-account*" -delete
find . -name "LICENSE" -delete
```

### Step 5: Push करना
```bash
git add -A
git commit -m "Sync: Update from upstream eatsgram repository"
git push origin main
```

---

## 🛡️ Security Considerations

### Automatic Cleanup:
- ✅ Google service account files
- ✅ LICENSE files
- ✅ .env files
- ✅ Secret patterns

### Manual Review:
कुछ changes को manually review करना चाहिए:
- Breaking changes
- API changes
- Database migrations
- Security patches

---

## 📝 Troubleshooting

### Problem: Workflow Failed

**Solution:**
1. Actions tab में logs देखें
2. Error message को read करें
3. Common issues:
   - **Merge conflicts** - Manual merge करें
   - **Permission denied** - Token permissions check करें
   - **Push failed** - Branch protection rules check करें

### Problem: Changes Push नहीं हुए

**Solution:**
1. Repository settings में branch protection check करें
2. Bot user को push permissions दें
3. GITHUB_TOKEN को verify करें

### Problem: Workflow नहीं चल रहा

**Solution:**
1. Workflow file syntax check करें
2. `.github/workflows/` folder में file है या नहीं check करें
3. Cron schedule को verify करें

---

## 📈 Monitoring Best Practices

### Daily Check:
- [ ] Actions tab में latest run check करें
- [ ] Logs में errors देखें
- [ ] New commits को review करें

### Weekly Check:
- [ ] Upstream repository में major changes हैं या नहीं
- [ ] Conflicts हैं या नहीं
- [ ] Breaking changes हैं या नहीं

### Monthly Check:
- [ ] Workflow performance review करें
- [ ] Schedule को optimize करें
- [ ] Documentation update करें

---

## 🔗 Useful Links

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Cron Syntax](https://crontab.guru/)
- [Original eatsgram Repository](https://github.com/eatsgram/eatsgram)

---

## 📞 Support

अगर कोई issue हो:

1. **GitHub Issues** में report करें
2. **Email**: lokeshrao050@gmail.com
3. **Logs** को attach करें

---

## 🎯 Next Steps

1. ✅ Workflows को test करें
2. ✅ Schedule को customize करें
3. ✅ Monitoring setup करें
4. ✅ Team को notify करें

---

**Last Updated**: October 16, 2025
**Maintained by**: EatsGram Team
