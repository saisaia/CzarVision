const API_KEY = 'a1e72fd93ed59f56e6332813b9f8dcae';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/original';

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

// ================== Apimocine Fetch ==================
async function fetchApiMovies() {
  try {
    const res = await fetch('https://apimocine.vercel.app/movie/');
    const data = await res.json();
    return data.results || [];
  } catch (e) {
    console.error('Error fetching Apimocine movies:', e);
    return [];
  }
}

async function fetchApiTV() {
  try {
    const res = await fetch('https://apimocine.vercel.app/tv/');
    const data = await res.json();
    return data.results || [];
  } catch (e) {
    console.error('Error fetching Apimocine TV:', e);
    return [];
  }
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
    if (!item.poster_path && !item.image) return;
    const img = document.createElement('img');
    img.src = item.poster_path ? `${IMG_URL}${item.poster_path}` : item.image;
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
  if (modalDesc) modalDesc.textContent = item.overview || item.description || "";

  const modalImg = document.getElementById('modal-image');
  if (modalImg) modalImg.src = item.poster_path ? `${IMG_URL}${item.poster_path}` : item.image;

  const modalRating = document.getElementById('modal-rating');
  if (modalRating) modalRating.innerHTML = item.vote_average ? '★'.repeat(Math.round(item.vote_average / 2)) : "";

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
    const moviesTMDB = await fetchTrending('movie');
    const tvTMDB = await fetchTrending('tv');
    const animeTMDB = await fetchTrendingAnime();

    const moviesAPI = await fetchApiMovies();
    const tvAPI = await fetchApiTV();

    const allMovies = [...moviesTMDB, ...moviesAPI];
    const allTV = [...tvTMDB, ...tvAPI];

    if (allMovies.length > 0) displayBanner(allMovies[Math.floor(Math.random() * allMovies.length)]);

    displayList(allMovies, 'movies-list');
    displayList(allTV, 'tvshows-list');
    displayList(animeTMDB, 'anime-list');

  } catch (err) {
    console.error("Error initializing content:", err);
  }
}

// Start
document.addEventListener("DOMContentLoaded", init);
