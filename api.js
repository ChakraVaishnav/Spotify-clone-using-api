// ===== CONFIGURATION =====
// Get configuration from config.js (generated from .env)
const CONFIG = window.CONFIG || {};
const clientId = CONFIG.SPOTIFY_CLIENT_ID || '2bfeb25127d34c8fa26bae287a318f97';

// Validate client ID
if (!clientId) {
    console.error('❌ SPOTIFY_CLIENT_ID is not set! Please check your config.js file.');
    alert('Configuration error: Spotify Client ID is missing. Please check the console for details.');
}

// Auto-detect redirect URI based on current location
function getRedirectUri() {
    // If custom URIs are defined in config, use them
    if (CONFIG.NODE_ENV === 'production' && CONFIG.PROD_REDIRECT_URI) {
        return CONFIG.PROD_REDIRECT_URI;
    }
    if (CONFIG.NODE_ENV === 'development' && CONFIG.DEV_REDIRECT_URI) {
        return CONFIG.DEV_REDIRECT_URI;
    }
    
    // Otherwise, auto-detect from current location
    const currentUrl = window.location.origin + window.location.pathname;
    return currentUrl;
}

const redirectUri = getRedirectUri();
const scope = 'user-read-private user-read-email user-top-read user-library-read';

console.log('🎵 Spotify Clone initialized');
console.log('Environment:', CONFIG.NODE_ENV || 'auto-detect');
console.log('Redirect URI:', redirectUri);

// ===== DOM ELEMENTS =====
const loginButton = document.getElementById('login');
const logoutButton = document.getElementById('logout');
const sidebar = document.querySelector('.sidebar');
const menuButton = document.querySelector('.fa-bars');
const overlay = document.querySelector('.overlay');

// ===== SIDEBAR MENU =====
menuButton.onclick = function () {
    sidebar.style.left = '0';
    overlay.style.visibility = 'visible';
};

overlay.onclick = function () {
    sidebar.style.left = '-250px';
    overlay.style.visibility = 'hidden';
};

// ===== INITIAL DISPLAY STATE =====
document.getElementById('top').style.display = 'none';
document.getElementById('liked').style.display = 'none';
document.getElementById('lib').style.display = 'none';
document.getElementById('results').style.display = 'none';

// ===== PKCE HELPER FUNCTIONS =====
// Generate random string for PKCE
function generateRandomString(length) {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], '');
}

// Generate code challenge from verifier
async function sha256(plain) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return window.crypto.subtle.digest('SHA-256', data);
}

function base64encode(input) {
    return btoa(String.fromCharCode(...new Uint8Array(input)))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}

// ===== SPOTIFY AUTHORIZATION (PKCE) =====
loginButton.addEventListener('click', async function () {
    console.log('🔐 Starting Spotify login with PKCE...');
    
    // Generate PKCE code verifier and challenge
    const codeVerifier = generateRandomString(64);
    const hashed = await sha256(codeVerifier);
    const codeChallenge = base64encode(hashed);

    // Store code verifier for later use
    localStorage.setItem('code_verifier', codeVerifier);

    // Build authorization URL with PKCE
    const authUrl = new URL('https://accounts.spotify.com/authorize');
    const params = {
        client_id: clientId,
        response_type: 'code',
        redirect_uri: redirectUri,
        scope: scope,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
        show_dialog: 'true'
    };

    authUrl.search = new URLSearchParams(params).toString();
    window.location.href = authUrl.toString();
});

// ===== HANDLE AUTHORIZATION CALLBACK =====
async function handleCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
        console.log('✅ Authorization code received, exchanging for token...');
        
        const codeVerifier = localStorage.getItem('code_verifier');
        if (!codeVerifier) {
            console.error('❌ Code verifier not found');
            alert('Login error: Code verifier missing. Please try again.');
            return;
        }

        try {
            // Exchange code for access token
            const response = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    client_id: clientId,
                    grant_type: 'authorization_code',
                    code: code,
                    redirect_uri: redirectUri,
                    code_verifier: codeVerifier
                })
            });

            if (!response.ok) {
                throw new Error('Token exchange failed: ' + response.statusText);
            }

            const data = await response.json();
            
            // Store tokens
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token);
            localStorage.setItem('expires_at', Date.now() + data.expires_in * 1000);
            
            // Clean up
            localStorage.removeItem('code_verifier');
            
            // Remove code from URL
            window.history.replaceState({}, document.title, window.location.pathname);
            
            console.log('✅ Successfully logged in!');
            
            // Fetch user data and display home
            await fetchName();
            getTopTracks();
        } catch (error) {
            console.error('❌ Error during token exchange:', error);
            alert('Login failed: ' + error.message);
        }
    }
}

// ===== TOKEN MANAGEMENT =====
let accessToken = localStorage.getItem('access_token');

// Check if we need to handle callback
if (window.location.search.includes('code=')) {
    handleCallback();
} else if (accessToken) {
    // Check if token is expired
    const expiresAt = localStorage.getItem('expires_at');
    if (expiresAt && Date.now() > parseInt(expiresAt)) {
        console.log('⚠️ Token expired, please log in again');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('expires_at');
        accessToken = null;
    } else {
        console.log('✅ Using existing access token');
        fetchName();
        getTopTracks();
    }
}

// ===== LOGOUT =====
logoutButton.addEventListener('click', function () {
    console.log('👋 Logging out...');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('expires_at');
    localStorage.removeItem('code_verifier');
    window.location.href = redirectUri;
});

// ===== API HELPER FUNCTION =====
async function spotifyApi(endpoint) {
    const token = localStorage.getItem('access_token');
    if (!token) {
        alert('Please log in first.');
        return null;
    }

    try {
        const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                console.error('❌ Token expired or invalid');
                localStorage.removeItem('access_token');
                alert('Session expired. Please log in again.');
                return null;
            }
            throw new Error(`API error: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return null;
    }
}

// ===== FETCH USER NAME =====
async function fetchName() {
    const data = await spotifyApi('/me');
    if (data) {
        const userName = data.display_name || 'User';
        const log = document.querySelector('.log');
        log.innerHTML = `Hi, ${userName}`;
        console.log('👤 User:', userName);
    }
}

// ===== SEARCH FOR A SONG =====
async function searchSong(query) {
    if (!localStorage.getItem('access_token')) {
        alert('Please log in first.');
        return;
    }

    document.getElementById('top').style.display = 'none';
    document.getElementById('liked').style.display = 'none';
    document.getElementById('lib').style.display = 'none';
    document.getElementById('results').style.display = '';

    const data = await spotifyApi(`/search?q=${encodeURIComponent(query)}&type=track`);
    if (data && data.tracks) {
        displayResults(data.tracks.items);
    }
}

// ===== GET TOP TRACKS =====
async function getTopTracks() {
    if (!localStorage.getItem('access_token')) {
        alert('Please log in first.');
        return;
    }

    document.getElementById('results').style.display = 'none';
    document.getElementById('liked').style.display = 'none';
    document.getElementById('lib').style.display = 'none';
    document.getElementById('top').style.display = '';

    const data = await spotifyApi('/me/top/tracks?limit=15');
    if (data && data.items) {
        displayTopTracks(data.items);
    }
}

// ===== GET LIKED SONGS =====
async function getLikedSongs() {
    if (!localStorage.getItem('access_token')) {
        alert('Please log in first.');
        return;
    }

    document.getElementById('results').style.display = 'none';
    document.getElementById('top').style.display = 'none';
    document.getElementById('lib').style.display = 'none';
    document.getElementById('liked').style.display = '';

    const data = await spotifyApi('/me/tracks');
    if (data && data.items) {
        displayLikedSongs(data.items);
    }
}

// ===== GET YOUR LIBRARY =====
async function getYourLibrary() {
    if (!localStorage.getItem('access_token')) {
        alert('Please log in first.');
        return;
    }

    document.getElementById('results').style.display = 'none';
    document.getElementById('top').style.display = 'none';
    document.getElementById('liked').style.display = 'none';
    document.getElementById('lib').style.display = '';

    const data = await spotifyApi('/me/playlists');
    if (data && data.items) {
        displayYourLibrary(data.items);
    }
}

// ===== DISPLAY FUNCTIONS =====
function displayLikedSongs(items) {
    const resultsDiv = document.getElementById('liked-songs');
    resultsDiv.innerHTML = '';

    if (!items || items.length === 0) {
        resultsDiv.innerHTML += '<p>No liked songs found.</p>';
        return;
    }

    items.forEach(item => {
        const track = item.track;
        const songCard = document.createElement('div');
        songCard.classList.add('song-card');
        songCard.innerHTML = `
            <iframe src="https://open.spotify.com/embed/track/${track.id}" width="350" height="100" frameborder="0" allow="encrypted-media"></iframe>
        `;
        resultsDiv.appendChild(songCard);
    });
}

function displayResults(tracks) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    if (!tracks || tracks.length === 0) {
        resultsDiv.innerHTML = '<p>No results found. Try a different search.</p>';
        return;
    }

    tracks.forEach(track => {
        const songCard = document.createElement('div');
        songCard.classList.add('song-card');
        songCard.innerHTML = `
            <iframe src="https://open.spotify.com/embed/track/${track.id}" width="350" height="100" frameborder="0" allow="encrypted-media"></iframe>
        `;
        resultsDiv.appendChild(songCard);
    });
}

function displayTopTracks(tracks) {
    const resultsDiv = document.getElementById('Topsongs');
    resultsDiv.innerHTML = '';

    if (!tracks || tracks.length === 0) {
        resultsDiv.innerHTML = '<p>No top tracks found.</p>';
        return;
    }

    tracks.forEach(track => {
        const songCard = document.createElement('div');
        songCard.classList.add('song-card');
        songCard.innerHTML = `
            <iframe src="https://open.spotify.com/embed/track/${track.id}" width="350" height="100" frameborder="0" allow="encrypted-media"></iframe>
        `;
        resultsDiv.appendChild(songCard);
    });
}

function displayYourLibrary(items) {
    const resultsDiv = document.getElementById('lib-songs');
    resultsDiv.innerHTML = '';

    if (!items || items.length === 0) {
        resultsDiv.innerHTML += '<p>No playlists found in your library.</p>';
        return;
    }

    items.forEach(item => {
        const playlistCard = document.createElement('div');
        playlistCard.classList.add('playlist-card');
        playlistCard.innerHTML = `
            <iframe src="https://open.spotify.com/embed/playlist/${item.id}" width="300" height="380" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>
        `;
        resultsDiv.appendChild(playlistCard);
    });
}

// ===== SEARCH EVENT LISTENER =====
document.getElementById('search-btn').addEventListener('click', function () {
    const query = document.getElementById('search-input').value.trim();
    if (query) {
        searchSong(query);
    } else {
        alert('Please enter a song name to search.');
    }
});

// Allow search on Enter key
document.getElementById('search-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        const query = this.value.trim();
        if (query) {
            searchSong(query);
        }
    }
});
