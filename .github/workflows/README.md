# GitHub Actions Workflows for EatsGram

यह directory में EatsGram repository को automatically maintain करने के लिए GitHub Actions workflows हैं।

## Workflows Overview

### 1. **sync-upstream.yml** - Upstream Synchronization
**Purpose**: Original enatega repository से नई updates को automatically pull करना

**Schedule**: हर दिन 2 AM UTC (भारतीय समय में 7:30 AM)

**क्या करता है**:
- Original enatega repository से latest changes fetch करता है
- नई commits को merge करता है
- सभी "enatega" references को "EatsGram" से replace करता है
- Sensitive files (credentials, secrets) को remove करता है
- Changes को automatically push करता है

**Manual Trigger**: 
```
GitHub Actions tab → sync-upstream → Run workflow
```

---

### 2. **cleanup-sensitive-files.yml** - Sensitive Files Cleanup
**Purpose**: Repository में से sensitive files को automatically remove करना

**Trigger**: हर push या pull request पर

**क्या करता है**:
- सभी LICENSE files को remove करता है
- Google service account files को delete करता है
- .env files को remove करता है (except .env.example)
- Secret patterns को scan करता है
- Changes को commit और push करता है

---

### 3. **auto-rebrand.yml** - Auto Rebranding
**Purpose**: किसी भी enatega reference को automatically EatsGram में convert करना

**Trigger**: हर push या pull request पर

**क्या करता है**:
- सभी code files में enatega को eatsgram से replace करता है
- Enatega को EatsGram से replace करता है
- Directory names को rename करता है
- Changes को commit करता है

---

## कैसे काम करता है?

### Automatic Flow:
```
Original enatega repo में update
        ↓
sync-upstream workflow trigger होता है
        ↓
Changes को fetch और merge करता है
        ↓
auto-rebrand workflow चलता है
        ↓
सभी enatega references को EatsGram में convert करता है
        ↓
cleanup-sensitive-files workflow चलता है
        ↓
Sensitive files को remove करता है
        ↓
सभी changes को EatsGram repo में push करता है
```

---

## Configuration

### GitHub Secrets Required:
- `GITHUB_TOKEN` - Automatically provided by GitHub

### Environment Variables:
सभी workflows में निम्नलिखित configured हैं:
- Bot user: "EatsGram Bot"
- Bot email: "bot@eatsgram.local"

---

## Monitoring Workflows

### GitHub Actions Tab में देखें:
1. Repository के "Actions" tab पर जाएं
2. Workflow का नाम select करें
3. Latest run को देखें
4. Logs को check करें

### Workflow Status:
- ✅ Success - सभी changes successfully apply हुए
- ❌ Failed - कोई error आया (logs में देखें)
- ⏳ In Progress - Workflow चल रहा है

---

## Manual Triggers

### sync-upstream को manually run करें:
```bash
# GitHub UI से:
1. Actions tab खोलें
2. "Sync with Upstream Repository" select करें
3. "Run workflow" button दबाएं
```

---

## Troubleshooting

### अगर workflow fail हो:
1. **Logs check करें**: Actions tab में detailed logs देखें
2. **Permissions check करें**: Repository settings में push permissions verify करें
3. **Conflicts check करें**: अगर merge conflicts हों तो manually resolve करें

### अगर changes push न हों:
- Repository branch protection rules check करें
- Bot user को push permissions दें
- GITHUB_TOKEN को verify करें

---

## Best Practices

1. **Regular Monitoring**: हर हफ्ते workflows को check करें
2. **Manual Review**: Important changes को manually review करें
3. **Backup**: Critical changes से पहले backup लें
4. **Testing**: Production में deploy करने से पहले test करें

---

## Future Enhancements

- [ ] Slack notifications add करना
- [ ] Email alerts add करना
- [ ] Automated testing add करना
- [ ] Version tagging add करना
- [ ] Release notes generation add करना

---

**Last Updated**: October 16, 2025
**Maintained by**: EatsGram Team
