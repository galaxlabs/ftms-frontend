# tms-web (FTMS frontend) — کہاں چل رہا ہے

> یہ فائل بتاتی ہے کہ frontend کہاں deploy ہوتا ہے، کیسے اپ ڈیٹ ہوتا ہے، اور کون سی سروس کس کام آتی ہے۔

## 1. Hosting (Vercel)
| چیز | قیمت |
|---|---|
| Vercel project | `ftms-frontend` |
| Vercel team | `galaxlabs-projects` |
| Project ID | `prj_EpdtbpAd3kXnxLR4hh6DIBSf8w18` |
| Framework | Vite (Vue 3) |
| Root directory | `.` (یعنی یہی repo) |
| Production domain | `https://tms-web.celtcoksa.com` |
| Vercel alias | `https://ftms-frontend-nine.vercel.app` |

## 2. کوڈ کہاں سے آتا ہے (GitHub)
- Repo: `github.com/galaxlabs/ftms-frontend`
- Production branch: `master`
- **ہر push پر خودکار deploy ہوتا ہے** (Vercel اور GitHub منسلک ہیں)۔ `master` پر push کرنے سے نیا production build بنتا ہے۔
- Deploy کی تصدیق: Vercel ڈیش بورڈ یا CLI سے
  ```bash
  vercel ls ftms-frontend
  ```
  ہر deployment کے ساتھ `githubCommitSha` اور commit message دکھائی دیتا ہے۔

## 3. Backend سے رابطہ
- Backend: `https://ftms.galaxylabs.online` (Frappe، dev site)
- `vercel.json` کا rewrite: `/api/*` → `https://ftms.galaxylabs.online/api/*`
- اس لیے frontend میں API calls `/api/method/...` پر جاتی ہیں، اور کوکیز same-origin کی طرح کام کرتی ہیں۔
- Environment variable `VITE_FTMS_BACKEND_URL` خالی ہے (ڈیفالٹ)، یعنی rewrite ہی استعمال ہوتا ہے۔

## 4. Google login (منصوبہ بندی میں)
- Firebase project: `tms-web-129f5` (صرف authentication کے لیے؛ Firebase Hosting استعمال نہیں ہوتی)
- الگ project ہے، RideKSA کے `rideksa-84949` سے مکس نہیں ہوتا۔
- Firebase console میں دو کام ضروری ہیں: Google provider چالو کرنا، اور `tms-web.celtcoksa.com` کو Authentication کے authorized domains میں شامل کرنا۔
- Backend کے لیے اس project کا service account dev-b پر `Integration Settings` میں لگنا ہے۔

## 5. Domains اور اہم فائلیں
- `vercel.json`: API rewrite اور SPA fallback (`/(.*)` → `/index.html`)
- `src/lib/api.js`: تمام API calls کی فہرست
- `src/router.js`: صفحات اور راستے

## 6. نوٹ
- `tms-web.celtcoksa.com` کا DNS Vercel پر ہی رکھنا ہے۔ Firebase Hosting کے لیے کوئی CNAME تبدیل نہیں کرنا۔
- Secrets (API keys، service account JSON) اس فائل یا repo میں نہ رکھیں۔
