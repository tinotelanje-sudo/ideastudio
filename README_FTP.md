# IDEAI STUDIOS ULTRA - Deployment Guide

This application is optimized for professional hardware development and can be deployed to your FTP server at `ftp.nasadef.com.my`.

## 🚀 Auto-Deployment (In-App)

You can deploy directly from the IDE UI:
1. Click the **"Deploy to NASADEF"** button in the top navigation bar.
2. The system will bundle the application and upload it via FTP to your server.
3. Once finished, your app will be live at `https://aiapp.nasadef.com.my`.

## 📦 Portable Deployment (Manual)

To create a portable version for manual deployment:
1. Run `npm run build` to generate the `dist` folder.
2. Zip the contents of the `dist` folder.
3. Upload the zip to your FTP server and extract it to the web root (e.g., `/public_html`).

## 🛠 Configuration

The deployment uses the following credentials (stored securely in environment variables):
- **Host:** `ftp.nasadef.com.my`
- **User:** `razif@nasadef.com.my`
- **Remote Root:** `/public_html`

## 🤖 AI Integration

- **Online Mode:** Uses Gemini 3.1 Pro for advanced code generation.
- **Offline Mode:** Uses a local SQLite database for common Arduino patterns when internet is unavailable.

---
*Created by RAZIF for IDEAI STUDIOS ULTRA*
