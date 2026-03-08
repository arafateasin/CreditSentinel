# Credit Sentinel — Quick Start Guide
## 📱 For Credit Officers

### 🔐 Login
1. Go to: **https://credit-sentinel-five.vercel.app**
2. Auto-login (demo mode) — no credentials needed

---

### ➕ Submit New Application

1. **Click "New Application"** in sidebar
2. **Fill details:**
   - Customer Name
   - Requested Limit (RM)
   - Salesman Name
3. **Upload CTOS PDF** (drag & drop or browse)
4. **Click "🤖 Start Agent Processing"**
5. **Wait 20-60 seconds** for AI to complete
6. **Review results** on Agent Assessment page

---

### 📋 Monitor Queue

1. **Click "Applications Queue"**
2. **Filter by:** All / Pending / Approved / Rejected
3. **Click application** to view details

---

### ✅ Review & Approve

**For Auto-Approved (>70% score):**
- ✅ Review and confirm

**For Medium Risk (40-70% score):**
1. **Click "Decision & Approval"**
2. **Review extracted data**
3. **Check risk score breakdown**
4. **Read BM + EN rationale**
5. **Approve / Reject / Request More Info**
6. **Add notes**
7. **Click "Confirm"**

**For Auto-Rejected (<40% score):**
- Review rationale and confirm rejection

---

### 🎯 Key Features

#### Real-Time Progress
Watch live AI agent execution:
- 🔵 Uploading PDF
- 🔵 Processing CTOS Document
- 🔵 AI Extracting Fields
- 🔵 Calculating Risk Score
- 🔵 Generating Decision
- 🟢 Complete!

#### Bilingual Rationale
Every decision has:
- 🇲🇾 Bahasa Malaysia explanation
- 🇬🇧 English translation

#### PII Protection
Auto-masks:
- IC Numbers: `123456-01-XXXX`
- Phone: `+60-3-7XXX-XXXX`

#### Audit Trail
100% of actions logged:
- Who did what
- When it happened
- Complete document history

---

### 🚨 Troubleshooting

**Upload fails?**
→ Check file is PDF, <10MB, real CTOS report

**Processing hangs?**
→ Wait 60 seconds, refresh, check Queue

**Wrong extraction?**
→ Use "Review Extraction" to edit fields

**Score seems wrong?**
→ Check "Score & Recommendation" for rule breakdown

---

### 📊 Decision Matrix

| Risk Score | Action | Credit Limit |
|-----------|---------|--------------|
| **>70%** | Auto-Approve | Up to RM 250k |
| **40-70%** | Officer Review | RM 50k-150k |
| **<40%** | Auto-Reject | N/A |

---

### 📞 Quick Reference

- **App URL**: https://credit-sentinel-five.vercel.app
- **API Docs**: https://credit-sentinel-api-production.up.railway.app/docs
- **GitHub**: https://github.com/arafateasin/CreditSentinel
- **Submission**: March 8, 2026

---

**Powered by Azure AI + LangGraph** 🛡️
