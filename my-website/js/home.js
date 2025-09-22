// ================== API KEYS & URLs ==================
const TMDB_API_KEY = 'a1e72fd93ed59f56e6332813b9f8dcae';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMG_URL = 'https://image.tmdb.org/t/p/original';

const API_MOCINE_MOVIE = 'https://apimocine.vercel.app/movie/';
const API_MOCINE_TV = 'https://apimocine.vercel.app/tv/';

let currentItem;

// ================== Fetch Functions ==================

// TMDB Trending Movies/TV
async function fetchTrending(type) {
  try {
    const res = await fetch(`${TMDB_BASE_URL}/trending/${type}/week?api_key=${TMDB_API_KEY}`);
    const data = await res.json();
    return data.results;
  } catch (err) {
    console.error("TMDB Trending Error:", err);
    return [];
  }
}

// TMDB Anime
async function fetchTrendingAnime() {
  let allResults = [];
  for (let page = 1; page <= 3; page++) {
    try {
      const res = await fetch(`${TMDB_BASE_URL}/trending/tv/week?api_key=${TMDB_API_KEY}&page=${page}`);
      const data = await res.json();
      const filtered = data.results.filter(item => item.original_language === 'ja' && item.genre_ids.includes(16));
      allResults = allResults.concat(filtered);
    } catch (err) { console.error("TMDB Anime Error:", err); }
  }
  return allResults;
}

// Apimocine Movies
async function fetchMocineMovies() {
  try {
    const res = await fetch(API_MOCINE_MOVIE);
    return await res.json();
  } catch (err) { console.error("Mocine Movie Error:", err); return []; }
}

// Apimocine TV
async function fetchMocineTV() {
  try {
    const res = await fetch(API_MOCINE_TV);
    return await res.json();
  } catch (err) { console.error("Mocine TV Error:", err); return []; }
}

// ================== Display Functions ==================

function displayBanner(item) {
  const banner = document.getElementById('banner');
  if (!banner) return;

  banner.style.backgroundImage = item.backdrop_path ? `url(${TMDB_IMG_URL}${item.backdrop_path})` : `url(${item.poster})`;

  const titleEl = document.getElementById('banner-title');
  if (titleEl) titleEl.textContent = item.title || item.name || item.name_movie;

  const overviewEl = document.getElementById('banner-overview');
  if (overviewEl) overviewEl.textContent = item.overview || item.description || "";

  const playBtn = document.getElementById('banner-play');
  if (playBtn) playBtn.onclick = () => showDetails(item);

  const listBtn = document.getElementById('banner-list');
  if (listBtn) listBtn.onclick = () => toggleMyList(item);
}

function displayList(items, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  items.forEach(item => {
    let imgSrc = item.poster_path ? `${TMDB_IMG_URL}${item.poster_path}` : item.poster;
    if (!imgSrc) return;
    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = item.title || item.name || item.name_movie;
    img.classList.add("fade-in");
    img.onclick = () => showDetails(item);
    container.appendChild(img);
  });
}

// ================== Modal ==================

function showDetails(item) {
  currentItem = item;
  const modalTitle = document.getElementById('modal-title');
  if (modalTitle) modalTitle.textContent = item.title || item.name || item.name_movie;

  const modalDesc = document.getElementById('modal-description');
  if (modalDesc) modalDesc.textContent = item.overview || item.description || "";

  const modalImg = document.getElementById('modal-image');
  if (modalImg) modalImg.src = item.poster_path ? `${TMDB_IMG_URL}${item.poster_path}` : item.poster;

  const modalRating = document.getElementById('modal-rating');
  if (modalRating) modalRating.innerHTML = item.vote_average ? '★'.repeat(Math.round(item.vote_average / 2)) : '';

  changeServer();
  updateListButton(item);

  const modal = document.getElementById('modal');
  if (modal) modal.style.display = 'flex';
}

function changeServer() {
  if (!currentItem) return;
  const server = document.getElementById('server')?.value;
  const type = currentItem.media_type === "movie" ? "movie" : "tv";
  let embedURL = currentItem.link || "";

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
  if (!query || !query.trim()) return;
  const res = await fetch(`${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${query}`);
  const data = await res.json();
  const container = document.getElementById('search-results');
  if (!container) return;
  container.innerHTML = '';
  data.results.forEach(item => {
    let imgSrc = item.poster_path ? `${TMDB_IMG_URL}${item.poster_path}` : '';
    if (!imgSrc) return;
    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = item.title || item.name;
    img.onclick = () => { closeSearchModal(); showDetails(item); };
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
    const [movies, tvShows, anime, mocineMovies, mocineTV] = await Promise.all([
      fetchTrending('movie'),
      fetchTrending('tv'),
      fetchTrendingAnime(),
      fetchMocineMovies(),
      fetchMocineTV()
    ]);

    const allMovies = [...movies, ...mocineMovies];
    const allTV = [...tvShows, ...mocineTV];

    if (allMovies.length > 0) displayBanner(allMovies[Math.floor(Math.random() * allMovies.length)]);
    displayList(allMovies, 'movies-list');
    displayList(allTV, 'tvshows-list');
    displayList(anime, 'anime-list');

  } catch (err) {
    console.error("Error initializing content:", err);
  }
}

document.addEventListener("DOMContentLoaded", init);
