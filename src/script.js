const clientId = "YOUR_SPOTIFY_CLIENT_ID"; // Remplacez par votre client ID Spotify
let accessToken = localStorage.getItem("access_token");

if (isTokenValid()) {
    await displayProfileAndArtists(accessToken);
} else {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
        accessToken = await getAccessToken(clientId, code);
        await displayProfileAndArtists(accessToken);

        window.history.replaceState({}, document.title, "/");
    } else {
        accessToken = await refreshAccessToken(clientId);

        if (accessToken && isTokenValid()) {
            await displayProfileAndArtists(accessToken);
        } else {
            redirectToAuthCodeFlow(clientId);
        }
    }
}

export async function redirectToAuthCodeFlow(clientId) {
    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem("verifier", verifier);

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", "http://127.0.0.1:5173");
    params.append("scope", "user-read-private user-read-email user-follow-read");
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);

    document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

function generateCodeVerifier(length) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

async function generateCodeChallenge(codeVerifier) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

export async function getAccessToken(clientId, code) {
    const verifier = localStorage.getItem("verifier");

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", "http://127.0.0.1:5173");
    params.append("code_verifier", verifier);

    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
    });

    const { access_token, refresh_token, expires_in } = await result.json();

    const expireTime = Date.now() + expires_in * 1000;

    localStorage.setItem("access_token", access_token);
    localStorage.setItem("access_token_expire", expireTime);
    if (refresh_token) localStorage.setItem("refresh_token", refresh_token);

    return access_token;
}

function isTokenValid() {
    const token = localStorage.getItem("access_token");
    const expireTime = localStorage.getItem("access_token_expire");

    if (!token || !expireTime) return false;
    return Date.now() < Number(expireTime); 
}

export async function refreshAccessToken(clientId) {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) return null;

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "refresh_token");
    params.append("refresh_token", refreshToken);

    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
    });

    const { access_token, expires_in } = await result.json();

    const expireTime = Date.now() + expires_in * 1000;
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("access_token_expire", expireTime);

    return access_token;
}

async function fetchProfile(token) {
    const result = await fetch("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${token}` }
    });
    return await result.json();
}

async function fetchFollowedArtists(token) {
    const result = await fetch("https://api.spotify.com/v1/me/following?type=artist&limit=50", {
        headers: { Authorization: `Bearer ${token}` }
    });

    const data = await result.json();
    return data.artists.items; 
}

function populateUI(profile) {
    document.getElementById("displayName").innerText = profile.display_name;
}

function populateArtists(artists) {
    const artistList = document.getElementById("artistList");
    artistList.innerHTML = ""; 

    artists.forEach(artist => {
        const div = document.createElement("div");
        div.style.width = "180px";
        div.style.margin = "12px";
        div.style.display = "inline-block";
        div.style.verticalAlign = "top";
        div.style.textAlign = "center";
        div.style.padding = "18px 12px 16px 12px";

        const imgLink = document.createElement("a");
        imgLink.href = artist.external_urls.spotify;
        imgLink.target = "_blank";
        imgLink.style.display = "block";

        const img = document.createElement("img");
        img.src = artist.images[0]?.url || "";
        img.alt = artist.name;
        img.style.width = "160px";
        img.style.height = "160px";
        img.style.objectFit = "cover";
        img.style.borderRadius = "50%";
        img.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
        img.style.cursor = "pointer";

        imgLink.appendChild(img);

        const name = document.createElement("p");
        name.innerText = artist.name;
        name.style.margin = "14px 0 8px 0";
        name.style.fontWeight = "bold";
        name.style.fontSize = "1.1em";
        name.style.color = "#fff";
        name.style.overflow = "hidden";
        name.style.textOverflow = "ellipsis";
        name.style.whiteSpace = "nowrap";

        div.appendChild(imgLink);
        div.appendChild(name);
        artistList.appendChild(div);
    });
}

async function displayProfileAndArtists(token) {
    const profile = await fetchProfile(token);
    populateUI(profile);
    const artists = await fetchFollowedArtists(token);
    populateArtists(artists);
}

document.getElementById("searchBtn").addEventListener("click", async () => {
    const query = document.getElementById("searchInput").value.trim();
    if (!query) return;
    const tracks = await searchTracks(accessToken, query);
    populateSearchResults(tracks);
});

document.getElementById("resetSearchBtn").addEventListener("click", () => {
    document.getElementById("searchInput").value = "";
    document.getElementById("searchResults").innerHTML = "";
});

async function searchTracks(token, query) {
    const params = new URLSearchParams();
    params.append("q", query);
    params.append("type", "track");
    params.append("limit", 20);

    const result = await fetch(`https://api.spotify.com/v1/search?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const data = await result.json();
    return data.tracks.items; 
}

function populateSearchResults(tracks) {
    const resultsDiv = document.getElementById("searchResults");
    resultsDiv.innerHTML = "";

    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    table.style.background = "#181818";
    table.style.color = "#fff";
    table.style.fontFamily = "Arial, Helvetica, sans-serif";
    table.style.marginTop = "16px";
    table.style.borderRadius = "12px";
    table.style.overflow = "hidden";
    table.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    ["Titre", "Artiste(s)", "", ""].forEach(text => {
        const th = document.createElement("th");
        th.innerText = text;
        th.style.padding = "12px 8px";
        th.style.background = "#282828";
        th.style.fontWeight = "bold";
        th.style.textAlign = "left";
        th.style.fontSize = "1em";
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    tracks.forEach(track => {
        const row = document.createElement("tr");
        row.style.borderBottom = "1px solid #282828";
        row.onmouseover = () => row.style.background = "#232323";
        row.onmouseout = () => row.style.background = "";

        const nameTd = document.createElement("td");
        nameTd.innerText = track.name;
        nameTd.style.padding = "8px";
        nameTd.style.fontWeight = "bold";
        nameTd.style.fontSize = "1em";
        row.appendChild(nameTd);

        const artistsTd = document.createElement("td");
        artistsTd.innerText = track.artists.map(a => a.name).join(", ");
        artistsTd.style.padding = "8px";
        artistsTd.style.fontSize = "0.95em";
        artistsTd.style.color = "#b3b3b3";
        row.appendChild(artistsTd);

        const playTd = document.createElement("td");
        playTd.style.padding = "8px";
        const playBtn = document.createElement("button");
        playBtn.innerText = "Écouter";
        playBtn.title = "Écouter";
        playBtn.style.background = "#1db954";
        playBtn.style.color = "#fff";
        playBtn.style.border = "none";
        playBtn.style.borderRadius = "20px";
        playBtn.style.padding = "8px 16px";
        playBtn.style.cursor = "pointer";
        playBtn.style.fontSize = "1em";
        playBtn.style.transition = "background 0.2s";
        playBtn.onmouseover = () => playBtn.style.background = "#1ed760";
        playBtn.onmouseout = () => playBtn.style.background = "#1db954";
        playBtn.addEventListener("click", () => {
            const playerDiv = document.getElementById("spotifyPlayer");
            playerDiv.innerHTML = "";
            const iframe = document.createElement("iframe");
            iframe.src = `https://open.spotify.com/embed/track/${track.id}`;
            iframe.width = "1000";
            iframe.height = "380";
            iframe.allow = "encrypted-media";
            iframe.style.border = "none";
            playerDiv.appendChild(iframe);
        });
        playTd.appendChild(playBtn);
        row.appendChild(playTd);

        const linkTd = document.createElement("td");
        linkTd.style.padding = "8px";
        const linkBtn = document.createElement("a");
        linkBtn.href = track.external_urls.spotify;
        linkBtn.target = "_blank";
        linkBtn.innerText = "Voir sur Spotify";
        linkBtn.style.background = "#1db954"; 
        linkBtn.style.color = "#fff";
        linkBtn.style.border = "none";
        linkBtn.style.borderRadius = "20px";
        linkBtn.style.padding = "8px 16px";
        linkBtn.style.textDecoration = "none";
        linkBtn.style.fontSize = "1em";
        linkBtn.style.marginLeft = "8px";
        linkBtn.onmouseover = () => linkBtn.style.background = "#1ed760";
        linkBtn.onmouseout = () => linkBtn.style.background = "#1db954";
        linkTd.appendChild(linkBtn);
        row.appendChild(linkTd);

        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    resultsDiv.appendChild(table);
}
