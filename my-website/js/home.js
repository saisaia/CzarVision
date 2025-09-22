// ================== API CONFIG ==================
const TMDB_API_KEY = 'a1e72fd93ed59f56e6332813b9f8dcae';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/original';

const FILIPINO_MOVIE_API = 'https://apimocine.vercel.app/movie/';
const FILIPINO_TV_API = 'https://apimocine.vercel.app/tv/';

let currentItem;

// ================== FETCH FUNCTIONS ==================
async function fetchTMDBTrending(type) {
  const res = await fetch(`${TMDB_BASE}/trending/${type}/week?api_key=${TMDB_API_KEY}`);
  const data = await res.json();
  return data.results;
}

async function fetchTMDBAnime() {
  let allResults = [];
  for (let page = 1; page <= 3; page++) {
    const res = await fetch(`${TMDB_BASE}/trending/tv/week?api_key=${TMDB_API_KEY}&page=${page}`);
    const data = await res.json();
    const filtered = data.results.filter(item =>
      item.original_language === 'ja' && item.genre_ids.includes(16)
    );
    allResults = allResults.concat(filtered);
  }
  return allResults;
}

async function fetchFilipinoMovies() {
  try {
    const res = await fetch(FILIPINO_MOVIE_API);
    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.error('Filipino movies fetch error:', err);
    return [];
  }
}

async function fetchFilipinoTV() {
  try {
    const res = await fetch(FILIPINO_TV_API);
    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.error('Filipino TV fetch error:', err);
    return [];
  }
}

// ================== DISPLAY FUNCTIONS ==================
function displayBanner(item) {
  const banner = document.getElementById('banner');
  if (!banner) return;

  banner.style.backgroundImage = `url(${IMG_URL}${item.backdrop_path || item.poster_path})`;
  document.getElementById('banner-title').textContent = item.title || item.name;
  document.getElementById('banner-overview').textContent = item.overview || '';

  document.getElementById('banner-play').onclick = () => showDetails(item);
  document.getElementById('banner-list').onclick = () => toggleMyList(item);
}

function displayList(items, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  items.forEach(item => {
    const poster = item.poster_path || item.image || ''; // TMDB or Filipino API
    if (!poster) return;

    const img = document.createElement('img');
    img.src = item.poster_path ? `${IMG_URL}${poster}` : poster;
    img.alt = item.title || item.name;
    img.classList.add('fade-in');
    img.onclick = () => showDetails(item);
    container.appendChild(img);
  });
}

// ================== MODAL ==================
function showDetails(item) {
  currentItem = item;
  document.getElementById('modal-title').textContent = item.title || item.name;
  document.getElementById('modal-description').textContent = item.overview || '';
  document.getElementById('modal-image').src = item.poster_path ? `${IMG_URL}${item.poster_path}` : item.image || '';
  document.getElementById('modal-rating').innerHTML = '★'.repeat(Math.round((item.vote_average || 0) / 2));

  updateListButton(item);
  changeServer();

  document.getElementById('modal').style.display = 'flex';
}

function changeServer() {
  if (!currentItem) return;
  const server = document.getElementById('server')?.value;
  const type = currentItem.media_type === 'movie' || currentItem.type === 'movie' ? 'movie' : 'tv';
  let embedURL = '';

  if (server === 'vidsrc.cc') embedURL = `https://vidsrc.cc/v2/embed/${type}/${currentItem.id}`;
  else if (server === 'vidsrc.me') embedURL = `https://vidsrc.net/embed/${type}/?tmdb=${currentItem.id}`;
  else if (server === 'player.videasy.net') embedURL = `https://player.videasy.net/${type}/${currentItem.id}`;

  const iframe = document.getElementById('modal-video');
  if (iframe) iframe.src = embedURL;
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
  const iframe = document.getElementById('modal-video');
  if (iframe) iframe.src = '';
}

// ================== SEARCH ==================
function openSearchModal() {
  const searchModal = document.getElementById('search-modal');
  if (searchModal) {
    searchModal.style.display = 'flex';
    document.getElementById('search-input')?.focus();
  }
}

function closeSearchModal() {
  document.getElementById('search-modal').style.display = 'none';
  const results = document.getElementById('search-results');
  if (results) results.innerHTML = '';
}

async function searchTMDB() {
  const query = document.getElementById('search-input')?.value;
  if (!query || !query.trim()) return closeSearchModal();

  const res = await fetch(`${TMDB_BASE}/search/multi?api_key=${TMDB_API_KEY}&query=${query}`);
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

// ================== MY LIST ==================
function toggleMyList(item) {
  let myList = JSON.parse(localStorage.getItem('myList')) || [];
  const exists = myList.some(i => i.id === item.id);

  const btn = document.getElementById('add-to-list-btn');
  if (exists) {
    myList = myList.filter(i => i.id !== item.id);
    localStorage.setItem('myList', JSON.stringify(myList));
    if (btn) btn.textContent = '+ Add to My List';
  } else {
    myList.push(item);
    localStorage.setItem('myList', JSON.stringify(myList));
    if (btn) btn.textContent = '✓ Added';
  }
}

function updateListButton(item) {
  const myList = JSON.parse(localStorage.getItem('myList')) || [];
  const exists = myList.some(i => i.id === item.id);

  const btn = document.getElementById('add-to-list-btn');
  if (!btn) return;
  btn.textContent = exists ? '✓ Added' : '+ Add to My List';
  btn.onclick = () => toggleMyList(item);
}

// ================== INIT ==================
async function init() {
  try {
    const [movies, tvShows, anime, filipinoMovies, filipinoTV] = await Promise.all([
      fetchTMDBTrending('movie'),
      fetchTMDBTrending('tv'),
      fetchTMDBAnime(),
      fetchFilipinoMovies(),
      fetchFilipinoTV()
    ]);

    // Banner
    const allItems = [...movies, ...tvShows, ...anime, ...filipinoMovies, ...filipinoTV];
    if (allItems.length > 0) displayBanner(allItems[Math.floor(Math.random() * allItems.length)]);

    // Lists
    displayList(movies, 'movies-list');
    displayList(tvShows, 'tvshows-list');
    displayList(anime, 'anime-list');
    displayList(filipinoMovies, 'filipino-movies-list');
    displayList(filipinoTV, 'filipino-tv-list');
  } catch (err) {
    console.error('Initialization error:', err);
  }
}

// ================== START ==================
document.addEventListener('DOMContentLoaded', init);
