const SPOTIFY_CLIENT_ID = "67b411e20d594f30bf7a8d3bbde54285";
const SPOTIFY_CLIENT_SECRET = "161fc5e3df004b95af3ba8c62f3eaf54";
let ALBUM_ID = "0UMMIkurRUmkruZ3KGBLtG?si=8Zp7ugw0RaKH7AJF1PeY6w"; // Default album ID
const container = document.querySelector('div[data-js="tracks"]');
const albumCoverContainer = document.querySelector('.album-cover');
const albumLinkInput = document.getElementById('albumLinkInput');
const loadAlbumButton = document.getElementById('loadAlbumButton');

let currentPlayingTrack; // Variable to store the URL of the currently playing track
let audioPlayer = new Audio(); // Create an audio element for playing track previews

function fetchAlbum(token, albumId) {
  console.log("token: ", token);

  fetch(`https://api.spotify.com/v1/albums/${albumId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);

      if (data.tracks && data.tracks.items) {
        const albumTitle = data.name;
        const tracks = data.tracks.items;
        const albumCoverUrl = data.images[0].url;

        displayAlbum(albumTitle, tracks);
        displayAlbumCover(albumCoverUrl);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// Display album function with interactive track items
function displayAlbum(albumTitle, tracks) {
  container.innerHTML = ""; // Clear existing tracks
  const titleElement = document.createElement("h2");
  titleElement.textContent = albumTitle;
  titleElement.classList.add("album-title");

  const ul = document.createElement("ul");
  ul.classList.add("track-list");

  tracks.forEach((track, index) => {
    const li = document.createElement("li");
    li.classList.add("track-item");

    const trackNumber = document.createElement("span");
    trackNumber.textContent = index + 1;
    trackNumber.classList.add("track-number");

    const trackName = document.createElement("span");
    trackName.textContent = track.name;
    trackName.classList.add("track-name");

    const trackLength = document.createElement("span");
    trackLength.textContent = formatTrackDuration(track.duration_ms);
    trackLength.classList.add("track-length");

    // Store preview URL for each track item
    li.dataset.previewUrl = track.preview_url;

    // Only attach event listener if preview_url is available
    if (track.preview_url) {
      // Event listener to toggle play/pause icon and play the track
      li.addEventListener('click', () => {
        const isPlaying = togglePlayIcon(li);
        if (isPlaying) {
          playTrack(li.dataset.previewUrl, li); // Function to play the track
        } else {
          pauseTrack(); // Function to pause the track (if needed)
        }
      });
    }

    // Event listener for hover effect
    li.addEventListener('mouseenter', () => {
      li.classList.add('hovered');
    });

    li.addEventListener('mouseleave', () => {
      li.classList.remove('hovered');
    });

    li.appendChild(trackNumber);
    li.appendChild(trackName);
    li.appendChild(trackLength);

    ul.appendChild(li);
  });

  container.appendChild(titleElement);
  container.appendChild(ul);
}

function formatTrackDuration(durationMs) {
  const minutes = Math.floor(durationMs / 60000);
  const seconds = ((durationMs % 60000) / 1000).toFixed(0);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

function togglePlayIcon(trackItem) {
  const trackNumber = trackItem.querySelector('.track-number');
  if (trackNumber.textContent.trim() === '▶') {
    trackNumber.textContent = trackNumber.dataset.trackNumber;
    trackItem.classList.remove('clicked');
    albumCoverContainer.classList.remove('rotate');
    
    return false; // Track is paused
  } else {
    // Pause the currently playing track, if any
    if (currentPlayingTrack && currentPlayingTrack !== trackItem.dataset.previewUrl) {
      const currentlyPlayingItem = document.querySelector(`li[data-preview-url="${currentPlayingTrack}"]`);
      if (currentlyPlayingItem) {
        currentlyPlayingItem.classList.remove('clicked');
        currentlyPlayingItem.querySelector('.track-number').textContent = currentlyPlayingItem.querySelector('.track-number').dataset.trackNumber;
      }
      pauseTrack(); // Pause the current track
    }

    trackNumber.dataset.trackNumber = trackNumber.textContent;
    trackNumber.textContent = '▶';
    trackItem.classList.add('clicked');
    albumCoverContainer.classList.add('rotate');
    return true; // Track is playing
  }
}

// Play a track using the HTML audio element
function playTrack(previewUrl, trackItem) {
  if (!previewUrl) {
    console.error('Preview URL is not available.');
    return;
  }

  audioPlayer.src = previewUrl;
  audioPlayer.play().then(() => {
    console.log(`Playing track with preview URL: ${previewUrl}`);
    currentPlayingTrack = previewUrl;
    albumCoverContainer.classList.add('rotate');
  }).catch(error => {
    console.error('Error playing track', error);
  });
}

function pauseTrack() {
  audioPlayer.pause();
  console.log('Paused track');
}

function displayAlbumCover(albumCoverUrl) {
  albumCoverContainer.innerHTML = `<img src="${albumCoverUrl}" alt="Album Cover">`;
}

function fetchAccessToken() {
  fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `grant_type=client_credentials&client_id=${SPOTIFY_CLIENT_ID}&client_secret=${SPOTIFY_CLIENT_SECRET}`,
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (data.access_token) {
        fetchAlbum(data.access_token, ALBUM_ID);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// Event listener for load album button
loadAlbumButton.addEventListener('click', () => {
  const albumLink = albumLinkInput.value;
  const albumId = extractAlbumId(albumLink);
  if (albumId) {
    ALBUM_ID = albumId;
    fetchAccessToken();
  } else {
    console.error('Invalid Spotify album link.');
  }
});

// Extract album ID from Spotify link
function extractAlbumId(link) {
  const match = link.match(/album\/([a-zA-Z0-9]+)\?/);
  return match ? match[1] : null;
}

// Initial fetch for the default album
fetchAccessToken();
