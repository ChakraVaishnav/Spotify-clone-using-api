// Spotify credentials
const clientId = '2bfeb25127d34c8fa26bae287a318f97'; // Replace with your Client ID
const redirectUri = 'https://spotify-clone-using-api-vaishnav.vercel.app/'; // Replace with your Redirect URI
const scope = 'user-read-private user-read-email user-top-read user-library-read'; // Updated scope to include user-top-read

//menu
const sidebar = document.querySelector('.sidebar');
const menuButton = document.querySelector('.fa-bars');
const overlay = document.querySelector('.overlay');

menuButton.onclick = function () {
    sidebar.style.left = '0'; // Show sidebar
    overlay.style.visibility = 'visible'; // Show overlay
  };
  
  // Close sidebar when clicking on the overlay
  overlay.onclick = function () {
    sidebar.style.left = '-250px'; // Hide sidebar
    overlay.style.visibility = 'hidden'; // Hide overlay
  };

  document.getElementById('top').style.display = 'none';
    document.getElementById('liked').style.display='none';
    document.getElementById('lib').style.display='none';
    document.getElementById('results').style.display ="none";
// Redirect user to Spotify login
document.getElementById('login').addEventListener('click', function () {
    const authUrl =
        'https://accounts.spotify.com/authorize?client_id=' + clientId +
        '&response_type=token&redirect_uri=' + encodeURIComponent(redirectUri) +
        '&scope=' + encodeURIComponent(scope);
    window.location.href = authUrl;
});

// Extract access token from URL after redirect
const hash = window.location.hash.substring(1);
const params = new URLSearchParams(hash);
let accessToken = params.get('access_token');

// Store access token in localStorage if available
if (accessToken) {
    localStorage.setItem('access_token', accessToken);
    console.log('Access token retrieved:', accessToken);
    getTopTracks();
} else {
    // Retrieve access token from localStorage if it's already stored
    accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
        alert('Please log in using the login button to continue.');
        console.log('Access token not available. Please log in first.');
    } else {
        console.log('Using stored access token:', accessToken);
        getTopTracks();
    }
}

// Search for a song on Spotify
function searchSong(query) {
    if (!accessToken) {
        alert('Access token not available. Please log in first.');
        return;
    }

    const apiUrl = 'https://api.spotify.com/v1/search?q=' + encodeURIComponent(query) + '&type=track';
    document.getElementById('top').style.display = 'none';
    document.getElementById('liked').style.display='none';
    document.getElementById('lib').style.display='none';
    document.getElementById('results').style.display ="";
    fetch(apiUrl, {
        method: 'GET',
        headers: {
            Authorization: 'Bearer ' + accessToken,
        },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error fetching data from Spotify: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            displayResults(data.tracks.items);
        })
        .catch(error => {
            console.error('Error in search:', error);
        });
}

// Fetch top 15 tracks
function getTopTracks() {
    if (!accessToken) {
        alert('Access token not available. Please log in first.');
        return;
    }
    
    const apiUrl = 'https://api.spotify.com/v1/me/top/tracks?limit=15';
    document.getElementById('results').style.display = 'none';
    document.getElementById('liked').style.display='none';
    document.getElementById('lib').style.display='none';
    document.getElementById('top').style.display = '';
    
    fetch(apiUrl, {
        method: 'GET',
        headers: {
            Authorization: 'Bearer ' + accessToken,
        },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error fetching top tracks: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            displayTopTracks(data.items);
        })
        .catch(error => {
            console.error('Error in top tracks:', error);
        });
}
//getLikedSongs
function getLikedSongs() {
    if (!accessToken) {
        alert('Access token not available. Please log in first.');
        return;
    }

    const apiUrl = 'https://api.spotify.com/v1/me/tracks';
    document.getElementById('results').style.display = 'none';
    document.getElementById('top').style.display = 'none';
    document.getElementById('lib').style.display='none';
    document.getElementById('liked').style.display='';
    fetch(apiUrl, {
        method: 'GET',
        headers: {
            Authorization: 'Bearer ' + accessToken,
        },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error fetching liked songs: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            displayLikedSongs(data.items);
        })
        .catch(error => {
            console.error('Error in fetching liked songs:', error);
        });
}

// get your library

function getYourLibrary(){
    if (!accessToken) {
        alert('Access token not available. Please log in first.');
        return;
    }

    const apiUrl = 'https://api.spotify.com/v1/me/playlists';
    document.getElementById('results').style.display = 'none';
    document.getElementById('top').style.display = 'none';
    document.getElementById('liked').style.display='none';
    document.getElementById('lib').style.display='';
    fetch(apiUrl, {
        method: 'GET',
        headers: {
            Authorization: 'Bearer ' + accessToken,
        },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error fetching liked songs: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            displayYourLibrary(data.items);
        })
        .catch(error => {
            console.error('Error in fetching liked songs:', error);
        });
}

// Display liked songs
function displayLikedSongs(items) {
    const resultsDiv = document.getElementById('liked-songs');
    resultsDiv.innerHTML = ''; // Reset with the header

    if (!items || items.length === 0) {
        resultsDiv.innerHTML += '<p>No liked songs found.</p>';
        return;
    }

    items.forEach(item => {
        const track = item.track;

        const songCard = document.createElement('div');
        songCard.classList.add('song-card'); // Add class for styling

        songCard.innerHTML = `
            <iframe src="https://open.spotify.com/embed/track/${track.id}" width="300" height="80" frameborder="0" allow="encrypted-media"></iframe>
        `;

        resultsDiv.appendChild(songCard);
    });
}


// Display search results as embedded players
function displayResults(tracks) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = ''; // Clear previous results

    if (!tracks || tracks.length === 0) {
        resultsDiv.innerHTML = '<p>No results found. Try a different search.</p>';
        return;
    }

    tracks.forEach(track => {
        const songCard = document.createElement('div');
        songCard.classList.add('song-card'); // Add class for styling

        songCard.innerHTML = `
            <iframe src="https://open.spotify.com/embed/track/${track.id}" width="300" height="80" frameborder="0" allow="encrypted-media"></iframe>
        `;

        resultsDiv.appendChild(songCard);
    });
}

// Display top tracks as embedded players
function displayTopTracks(tracks) {
    const resultsDiv = document.getElementById('Topsongs');
    resultsDiv.innerHTML = '';  // Clear previous content
    if (!tracks || tracks.length === 0) {
        resultsDiv.innerHTML = '<p>No top tracks found.</p>';
        return;
    }
    
    tracks.forEach(track => {
        const songCard = document.createElement('div');
        songCard.classList.add('song-card'); // Add class for styling

        songCard.innerHTML = `
            <iframe src="https://open.spotify.com/embed/track/${track.id}" width="300" height="80" frameborder="0" allow="encrypted-media"></iframe>
        `;

        resultsDiv.appendChild(songCard);
    });
}
//Display Your Library
function displayYourLibrary(items){
    const resultsDiv = document.getElementById('lib-songs');
    resultsDiv.innerHTML = ''; // Reset with the header

    if (!items || items.length === 0) {
        resultsDiv.innerHTML += '<p>No playlists found in your library.</p>';
        return;
    }

    items.forEach(item => {
        const playlist = item;

        const playlistCard = document.createElement('div');
        playlistCard.classList.add('playlist-card'); // Add class for styling

        playlistCard.innerHTML = `
            <iframe src="https://open.spotify.com/embed/playlist/${playlist.id}" width="300" height="380" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>
        `;

        resultsDiv.appendChild(playlistCard);
    });
}



// Add event listener to the search button
document.getElementById('search-btn').addEventListener('click', function () {
    const query = document.getElementById('search-input').value.trim();
    if (query) {
        searchSong(query);
    } else {
        alert('Please enter a song name to search.');
    }
});
