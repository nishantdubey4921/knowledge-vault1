# 📚 Knowledge Vault

A minimalist dark-themed personal knowledge management system. Browse, read, and track files stored in your Google Drive — zero local storage cost.

---

## ✨ Features

- **Google Drive connected** — Files live in Drive, not on your server
- **5 knowledge categories** — Formal Sciences, Natural Sciences, Social Sciences, Arts & Humanities, Applied Sciences
- **Reading tracker** — Unread / Reading / Done status per file
- **Progress slider** — Track how far through a document you are
- **Time tracking** — Automatic session time logging
- **Notes panel** — Jot down thoughts while reading
- **Search & filter** — Find files instantly
- **Minimalist dark UI** — Pure black + white, zero clutter

---

## 🚀 Deploy on Vercel

### Step 1: Google Cloud Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or use existing)
3. Enable **Google Drive API**
4. Go to **IAM & Admin → Service Accounts → Create Service Account**
5. Give it a name, click through
6. On the service account page, click **Keys → Add Key → Create new key → JSON**
7. Download the JSON file — this is your `GOOGLE_SERVICE_ACCOUNT_JSON`

### Step 2: Share Drive folder with Service Account

1. In Google Drive, create a folder for your vault files (or use existing)
2. Right-click folder → Share
3. Paste the service account email (looks like `xxx@xxx.iam.gserviceaccount.com`)
4. Give it **Viewer** access
5. Copy the folder ID from the URL: `drive.google.com/drive/folders/`**`THIS_PART`**

### Step 3: Deploy

```bash
# Clone / download this project
npm install
```

Create `.env.local` from `.env.local.example`:

```bash
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}  # full JSON, no line breaks
GOOGLE_DRIVE_FOLDER_ID=your_folder_id
```

On **Vercel**:
1. Push to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Add environment variables:
   - `GOOGLE_SERVICE_ACCOUNT_JSON` → paste the entire JSON (Vercel handles it)
   - `GOOGLE_DRIVE_FOLDER_ID` → your folder ID
4. Deploy!

---

## 🏗️ Local Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 How it works

- **Drive API** streams files through `/api/drive/file` — Google Docs/Sheets/Slides are exported as PDF automatically
- **Reading progress** is stored in `localStorage` — no database needed
- **Files are never downloaded** to the server — streamed directly to your browser
- **Service Account** allows server-side Drive access without OAuth login flow

---

## 🎨 Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Google Drive API v3
- Tailwind CSS v4
- Syne + DM Mono fonts
- Vercel (deployment)

