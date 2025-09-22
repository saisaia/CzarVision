const API_KEY = 'a1e72fd93ed59f56e6332813b9f8dcae';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/original';

const FILIPINO_MOVIE_API = 'https://apimocine.vercel.app/movie/';
const FILIPINO_TV_API = 'https://apimocine.vercel.app/tv/';

let currentItem;

// ================== Fetch Functions ==================
async function fetchTrending(type) {
  const res = await fetch(`${BASE_URL}/trending/${type}/week?api_key=${API_KEY}`);
  const data = await res.json();
  return data.results;
}

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

async function fetchFilipinoMovies() {
  const res = await fetch(FILIPINO_MOVIE_API);
  const data = await res.json();
  return data.results || [];
}

async function fetchFilipinoTV() {
  const res = await fetch(FILIPINO_TV_API);
  const data = await res.json();
  return data.results || [];
}

// ================== Display Functions ==================
function displayBanner(item) {
  const banner = document.getElementById('banner');
  if (!banner) return;

  banner.style.backgroundImage = `url(${item.backdrop_path ? IMG_URL + item.backdrop_path : item.backdrop || ''})`;
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
    const imgSrc = item.poster_path ? IMG_URL + item.poster_path : item.poster || '';
    if (!imgSrc) return;
    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = item.title || item.name;
    img.classList.add("fade-in");
    img.onclick = () => showDetails(item);
    container.appendChild(img);
  });
}

// ================== Modal Functions ==================
function showDetails(item) {
  currentItem = item;
  document.getElementById('modal-title').textContent = item.title || item.name;
  document.getElementById('modal-description').textContent = item.overview || '';
  document.getElementById('modal-image').src = item.poster_path ? IMG_URL + item.poster_path : item.poster || '';
  document.getElementById('modal-rating').innerHTML = item.vote_average ? '★'.repeat(Math.round(item.vote_average / 2)) : '';
  changeServer();
  updateListButton(item);
  document.getElementById('modal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
  document.getElementById('modal-video').src = '';
}

function changeServer() {
  if (!currentItem) return;
  const server = document.getElementById('server').value;
  const type = currentItem.media_type === "movie" ? "movie" : "tv";
  let embedURL = '';

  if (server === "vidsrc.cc") embedURL = `https://vidsrc.cc/v2/embed/${type}/${currentItem.id}`;
  else if (server === "vidsrc.me") embedURL = `https://vidsrc.net/embed/${type}/?tmdb=${currentItem.id}`;
  else if (server === "player.videasy.net") embedURL = `https://player.videasy.net/${type}/${currentItem.id}`;

  document.getElementById('modal-video').src = embedURL;
}

// ================== Search Functions ==================
function openSearchModal() {
  const searchModal = document.getElementById('search-modal');
  searchModal.style.display = 'flex';
  document.getElementById('search-input')?.focus();
}

function closeSearchModal() {
  const searchModal = document.getElementById('search-modal');
  searchModal.style.display = 'none';
  document.getElementById('search-results').innerHTML = '';
}

async function searchTMDB() {
  const query = document.getElementById('search-input').value;
  if (!query.trim()) return closeSearchModal();
  const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${query}`);
  const data = await res.json();
  const container = document.getElementById('search-results');
  container.innerHTML = '';
  data.results.forEach(item => {
    const imgSrc = item.poster_path ? IMG_URL + item.poster_path : '';
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
  if (exists) myList = myList.filter(i => i.id !== item.id);
  else myList.push(item);
  localStorage.setItem("myList", JSON.stringify(myList));
  updateListButton(item);
}

function updateListButton(item) {
  const btn = document.getElementById("add-to-list-btn");
  const myList = JSON.parse(localStorage.getItem("myList")) || [];
  btn.textContent = myList.some(i => i.id === item.id) ? "✓ Added" : "+ Add to My List";
  btn.onclick = () => toggleMyList(item);
}

// ================== Init ==================
async function init() {
  try {
    const movies = await fetchTrending('movie');
    const tvShows = await fetchTrending('tv');
    const anime = await fetchTrendingAnime();
    const filipinoMovies = await fetchFilipinoMovies();
    const filipinoTV = await fetchFilipinoTV();

    if (movies.length > 0) displayBanner(movies[Math.floor(Math.random() * movies.length)]);
    displayList(movies, 'movies-list');
    displayList(tvShows, 'tvshows-list');
    displayList(anime, 'anime-list');
    displayList(filipinoMovies, 'filipino-movies-list');
    displayList(filipinoTV, 'filipino-tv-list');
  } catch(err) {
    console.error("Error loading content:", err);
  }
}

document.addEventListener("DOMContentLoaded", init);
