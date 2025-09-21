// TMDB API Config
const API_KEY = "YOUR_TMDB_API_KEY"; // Replace with your API key
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w500";

// Elements
const banner = document.getElementById("banner");
const bannerTitle = document.getElementById("banner-title");
const moviesList = document.getElementById("movies-list");
const tvList = document.getElementById("tvshows-list");
const animeList = document.getElementById("anime-list");
const modal = document.getElementById("modal");
const modalImage = document.getElementById("modal-image");
const modalTitle = document.getElementById("modal-title");
const modalDescription = document.getElementById("modal-description");
const modalRating = document.getElementById("modal-rating");
const modalVideo = document.getElementById("modal-video");

// Helpers
const truncate = (text, max) => (text && text.length > max ? text.slice(0, max) + "..." : text);
const debounce = (func, delay = 500) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

// Fetch Data
async function fetchData(url) {
  const res = await fetch(url);
  return res.json();
}

// Banner
async function loadBanner() {
  const data = await fetchData(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`);
  const random = data.results[Math.floor(Math.random() * data.results.length)];
  banner.style.backgroundImage = `url(${IMG_URL}${random.backdrop_path})`;
  bannerTitle.textContent = random.title;
}

// Row Renderer
function renderRow(list, items, type = "movie") {
  list.innerHTML = "";
  items.forEach(item => {
    const img = document.createElement("img");
    img.src = item.poster_path ? IMG_URL + item.poster_path : "fallback.png";
    img.alt = item.title || item.name;
    img.loading = "lazy";
    img.onclick = () => openModal(item, type);
    list.appendChild(img);
  });
}

// Load Rows
async function loadRows() {
  const movies = await fetchData(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`);
  renderRow(moviesList, movies.results, "movie");

  const tv = await fetchData(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}`);
  renderRow(tvList, tv.results, "tv");

  const anime = await fetchData(`${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=16`);
  renderRow(animeList, anime.results, "tv");
}

// Modal
function openModal(item, type) {
  modal.style.display = "flex";
  modalImage.src = item.poster_path ? IMG_URL + item.poster_path : "fallback.png";
  modalTitle.textContent = item.title || item.name;
  modalDescription.textContent = truncate(item.overview, 300);
  modalRating.textContent = `⭐ ${item.vote_average.toFixed(1)} / 10`;
  changeServer(type, item.id);
}
function closeModal() { modal.style.display = "none"; }
function changeServer(type = "movie", id = null) {
  const server = document.getElementById("server").value;
  if (id) modalVideo.src = `https://${server}/embed/${type}?id=${id}`;
}

// Search
function openSearchModal() { document.getElementById("search-modal").style.display = "flex"; }
function closeSearchModal() { document.getElementById("search-modal").style.display = "none"; }
async function searchTMDB() {
  const query = document.getElementById("search-input").value;
  const resultsDiv = document.getElementById("search-results");
  if (!query) { resultsDiv.innerHTML = ""; return; }
  const data = await fetchData(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
  resultsDiv.innerHTML = "";
  data.results.forEach(item => {
    if (!item.poster_path) return;
    const img = document.createElement("img");
    img.src = IMG_URL + item.poster_path;
    img.alt = item.title || item.name;
    img.onclick = () => openModal(item, item.media_type);
    resultsDiv.appendChild(img);
  });
}
const debouncedSearch = debounce(searchTMDB, 400);

// Init
loadBanner();
loadRows();
