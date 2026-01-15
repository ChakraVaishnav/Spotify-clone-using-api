# Spotify Developer Dashboard Setup

## Step-by-Step Guide

### 1. Go to Spotify Developer Dashboard
Visit: https://developer.spotify.com/dashboard

### 2. Log in with your Spotify account

### 3. Create a new app (or use existing)
- Click "Create app"
- Fill in:
  - **App name**: Spotify Clone (or any name)
  - **App description**: Personal Spotify clone project
  - **Redirect URI**: See step 4
  - **Which API/SDKs are you planning to use?**: Check "Web API"
- Agree to terms and click "Save"

### 4. Configure Redirect URIs

**IMPORTANT**: You need to add BOTH redirect URIs:

#### For Local Development:
```
http://localhost:5500/
```

#### For Production (Vercel):
```
https://spotify-clone-using-api-vaishnav.vercel.app/
```

To add them:
1. Click on your app
2. Click "Settings"
3. Scroll to "Redirect URIs"
4. Click "Edit"
5. Add both URIs above (one per line)
6. Click "Save"

### 5. Copy your Client ID
1. In app settings, find "Client ID"
2. Click "Show client ID" 
3. Copy the ID
4. Paste it into your `.env` file:
   ```
   SPOTIFY_CLIENT_ID=paste_your_client_id_here
   ```

### 6. Important Notes

✅ **DO add both redirect URIs** - you need localhost for development and the Vercel URL for production

✅ **URI must match EXACTLY** - including the trailing slash `/`

✅ **No Client Secret needed** - This app uses PKCE flow which doesn't require a client secret

❌ **Don't share your Client ID publicly** - keep your `.env` file private

### 7. After Setup

1. Make sure `.env` has your Client ID
2. Run `node generate-config.js` (if you have Node.js)
3. Open your app with Live Server
4. Click "LogIn" button
5. Authorize with Spotify
6. Enjoy your music!

### Troubleshooting

**Error: "Invalid redirect URI"**
- Double-check the redirect URI in Spotify Dashboard matches your `.env` exactly
- Make sure you included the trailing `/`
- Wait a few seconds after saving in Spotify Dashboard

**Error: "Invalid client"**
- Your Client ID in `.env` might be wrong
- Re-copy from Spotify Dashboard

**Login button doesn't work**
- Open browser console (F12) and check for errors
- Make sure `config.js` is loaded before `api.js` in `index.html`
- Verify you ran `node generate-config.js` after editing `.env`
