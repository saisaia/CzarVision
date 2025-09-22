const API_KEY = 'a1e72fd93ed59f56e6332813b9f8dcae';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/original';

let currentItem;

// ================== Fetch Functions ==================

// TMDb Trending Movies/TV
async function fetchTrending(type) {
    const res = await fetch(`${BASE_URL}/trending/${type}/week?api_key=${API_KEY}`);
    const data = await res.json();
    return data.results;
}

// TMDb Anime
async function fetchTrendingAnime() {
    let allResults = [];
    for (let page = 1; page <= 3; page++) {
        const res = await fetch(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}&page=${page}`);
        const data = await res.json();
        const filtered = data.results.filter(item =>
            item.original_language === 'ja' && item.genre_ids.includes(16)
        );
        allResults = allResults.concat(filtered);
    }
    return allResults;
}

// Filipino Movies (TMDb, language=tl)
async function fetchFilipinoMovies() {
    const res = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_original_language=tl&sort_by=popularity.desc`);
    const data = await res.json();
    return data.results;
}

// Apimocine API
async function fetchApimocine(type) {
    const url = type === 'movie' ? 'https://apimocine.vercel.app/movie/' : 'https://apimocine.vercel.app/tv/';
    const res = await fetch(url);
    const data = await res.json();
    return data.results || data;
}

// ================== Banner ==================
function displayBanner(item) {
    const banner = document.getElementById('banner');
    if (!banner) return;

    banner.style.backgroundImage = `url(${IMG_URL}${item.backdrop_path || item.poster_path})`;

    const titleEl = document.getElementById('banner-title');
    if (titleEl) titleEl.textContent = item.title || item.name;

    const overviewEl = document.getElementById('banner-overview');
    if (overviewEl) overviewEl.textContent = item.overview || "";

    const playBtn = document.getElementById('banner-play');
    if (playBtn) playBtn.onclick = () => showDetails(item);

    const listBtn = document.getElementById('banner-list');
    if (listBtn) listBtn.onclick = () => toggleMyList(item);
}

// ================== Movie/Show List ==================
function displayList(items, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    items.forEach(item => {
        if (!item.poster_path) return;
        const img = document.createElement('img');
        img.src = `${IMG_URL}${item.poster_path}`;
        img.alt = item.title || item.name;
        img.classList.add("fade-in");
        img.onclick = () => showDetails(item);
        container.appendChild(img);
    });
}

// ================== Modal ==================
function showDetails(item) {
    currentItem = item;

    const modalTitle = document.getElementById('modal-title');
    if (modalTitle) modalTitle.textContent = item.title || item.name;

    const modalDesc = document.getElementById('modal-description');
    if (modalDesc) modalDesc.textContent = item.overview || "";

    const modalImg = document.getElementById('modal-image');
    if (modalImg) modalImg.src = `${IMG_URL}${item.poster_path}`;

    const modalRating = document.getElementById('modal-rating');
    if (modalRating) modalRating.innerHTML = '★'.repeat(Math.round((item.vote_average || 0) / 2));

    changeServer();
    updateListButton(item);

    const modal = document.getElementById('modal');
    if (modal) modal.style.display = 'flex';
}

function changeServer() {
    if (!currentItem) return;
    const server = document.getElementById('server')?.value;
    const type = currentItem.media_type === "movie" ? "movie" : "tv";
    let embedURL = "";

    if (server === "vidsrc.cc") {
        embedURL = `https://vidsrc.cc/v2/embed/${type}/${currentItem.id}`;
    } else if (server === "vidsrc.me") {
        embedURL = `https://vidsrc.net/embed/${type}/?tmdb=${currentItem.id}`;
    } else if (server === "player.videasy.net") {
        embedURL = `https://player.videasy.net/${type}/${currentItem.id}`;
    }

    const iframe = document.getElementById('modal-video');
    if (iframe) iframe.src = embedURL;
}

function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) modal.style.display = 'none';

    const iframe = document.getElementById('modal-video');
    if (iframe) iframe.src = '';
}

// ================== Search ==================
function openSearchModal() {
    const searchModal = document.getElementById('search-modal');
    if (searchModal) {
        searchModal.style.display = 'flex';
        document.getElementById('search-input')?.focus();
    }
}

function closeSearchModal() {
    const searchModal = document.getElementById('search-modal');
    if (searchModal) searchModal.style.display = 'none';

    const results = document.getElementById('search-results');
    if (results) results.innerHTML = '';
}

async function searchTMDB() {
    const query = document.getElementById('search-input')?.value;
    if (!query || !query.trim()) {
        document.getElementById('search-results').innerHTML = '';
        return;
    }

    const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
    const data = await res.json();

    const container = document.getElementById('search-results');
    if (!container) return;
    container.innerHTML = '';
    data.results.forEach(item => {
        if (!item.poster_path) return;
        const img = document.createElement('img');
        img.src = `${IMG_URL}${item.poster_path}`;
        img.alt = item.title || item.name;
        img.onclick = () => {
            closeSearchModal();
            showDetails(item);
        };
        container.appendChild(img);
    });
}

// ================== My List ==================
function toggleMyList(item) {
    let myList = JSON.parse(localStorage.getItem("myList")) || [];
    const exists = myList.some(i => i.id === item.id);

    const btn = document.getElementById("add-to-list-btn");

    if (exists) {
        myList = myList.filter(i => i.id !== item.id);
        localStorage.setItem("myList", JSON.stringify(myList));
        if (btn) btn.textContent = "+ Add to My List";
    } else {
        myList.push(item);
        localStorage.setItem("myList", JSON.stringify(myList));
        if (btn) btn.textContent = "✓ Added";
    }
}

function updateListButton(item) {
    const myList = JSON.parse(localStorage.getItem("myList")) || [];
    const exists = myList.some(i => i.id === item.id);

    const btn = document.getElementById("add-to-list-btn");
    if (!btn) return;

    btn.textContent = exists ? "✓ Added" : "+ Add to My List";
    btn.onclick = () => toggleMyList(item);
}

// ================== Init ==================
async function init() {
    try {
        // TMDb trending
        const movies = await fetchTrending('movie');
        const tvShows = await fetchTrending('tv');
        const anime = await fetchTrendingAnime();
        const filipinoMovies = await fetchFilipinoMovies();

        // Apimocine trending (optional)
        const apimocineMovies = await fetchApimocine('movie');
        const apimocineTV = await fetchApimocine('tv');

        // Banner
        const bannerItem = movies[Math.floor(Math.random() * movies.length)];
        if (bannerItem) displayBanner(bannerItem);

        // Display lists
        displayList(movies, 'movies-list');
        displayList(tvShows, 'tvshows-list');
        displayList(anime, 'anime-list');
        displayList(filipinoMovies, 'filipino-movies-list');

        // Optional: append Apimocine results to trending sections
        displayList(apimocineMovies, 'movies-list');
        displayList(apimocineTV, 'tvshows-list');

    } catch (err) {
        console.error("Error initializing content:", err);
    }
}

// Start
document.addEventListener("DOMContentLoaded", init);
