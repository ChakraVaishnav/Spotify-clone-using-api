# Spotify Clone - Setup Guide

## 🚀 Quick Start

### 1. Configure Environment Variables

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` and add your Spotify Client ID:
```env
SPOTIFY_CLIENT_ID=your_client_id_here
NODE_ENV=development
```

### 2. Get Spotify Client ID

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app or use an existing one
3. Copy the **Client ID**
4. Add redirect URIs in app settings:
   - For local development: `http://localhost:5500/` (or your local server URL)
   - For production: `https://your-domain.vercel.app/`

### 3. Generate config.js

**Option A: If you have Node.js installed**
```bash
node generate-config.js
```

**Option B: Manual setup**
The `config.js` file is already generated with your current settings. Just update the `.env` file.

### 4. Run the Application

**For Development (Live Server):**
- Open `index.html` with VS Code Live Server
- Or any local server on port 5500

**For Production:**
- Deploy to Vercel, Netlify, or any static hosting
- Make sure to update `PROD_REDIRECT_URI` in `.env`
- Run `node generate-config.js` before deploying
- Ensure the redirect URI matches what's in your Spotify app settings

## 🔧 Configuration Details

### Environment Variables (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `SPOTIFY_CLIENT_ID` | Your Spotify app client ID | `abc123def456...` |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `DEV_REDIRECT_URI` | Local development URL (optional) | `http://localhost:5500/` |
| `PROD_REDIRECT_URI` | Production URL (optional) | `https://yourapp.vercel.app/` |

### Auto-Detection

If you don't set `DEV_REDIRECT_URI` or `PROD_REDIRECT_URI`, the app will automatically detect the current URL and use it as the redirect URI. This works well for most cases.

## 🔐 Security Features

This app uses **PKCE (Proof Key for Code Exchange)** authorization flow:
- ✅ More secure than implicit grant
- ✅ No client secret needed
- ✅ Works from static websites
- ✅ Includes token refresh capability

## 📝 Important Notes

1. **Redirect URI Must Match**: The redirect URI in your `.env` MUST match what you configured in Spotify Developer Dashboard
2. **HTTPS in Production**: Spotify requires HTTPS for production apps
3. **config.js is Auto-Generated**: Don't edit `config.js` manually - always regenerate it from `.env`
4. **.env is Secret**: Never commit `.env` to git (it's in `.gitignore`)

## 🐛 Troubleshooting

### Login not working?
1. Check browser console for errors (F12)
2. Verify `SPOTIFY_CLIENT_ID` in `.env` is correct
3. Ensure redirect URI matches in both:
   - Your `.env` file
   - Spotify Developer Dashboard app settings
4. Make sure you ran `node generate-config.js` after editing `.env`

### "Invalid redirect URI" error?
- The redirect URI in `.env` must **exactly match** what's in your Spotify app settings
- Include trailing slash if your Spotify config has it

### Token expired?
- The app automatically detects expired tokens
- Just click login again to refresh

## 📂 File Structure

```
spotify-clone/
├── .env                  # Your config (git-ignored)
├── .env.example          # Example config
├── config.js             # Auto-generated from .env
├── generate-config.js    # Script to generate config.js
├── index.html            # Main HTML
├── api.js                # Spotify API logic
├── index.css             # Styles
└── images/               # Assets
```

## 🎵 Features

- 🔐 Secure PKCE login
- 🎧 View your top tracks
- ❤️ Browse liked songs
- 📚 Access your library
- 🔍 Search for songs
- 🌐 Works in dev and production

## 📄 License

MIT
