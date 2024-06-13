const SPOTIFY_CLIENT_ID = "67b411e20d594f30bf7a8d3bbde54285";
const SPOTIFY_CLIENT_SECRET = "161fc5e3df004b95af3ba8c62f3eaf54";
const ALBUM_ID = "3y4AaloFccKNLQcZNS9L8c?si=xgUhjdNtS7yMI6y7X5MvEA";
const container = document.querySelector('div[data-js="tracks"]');

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

        displayAlbum(albumTitle, tracks);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function displayAlbum(albumTitle, tracks) {
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

fetchAccessToken();
