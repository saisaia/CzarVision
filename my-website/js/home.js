let currentItem;
let currentRowItems = [];
let currentIndex = 0;

// ================== Fetch Functions ==================
async function fetchLupetMovies() {
  const res = await fetch('https://apimocine.vercel.app/movie/');
  const data = await res.json();
  return data.results || [];
}

async function fetchLupetTV() {
  const res = await fetch('https://apimocine.vercel.app/tv/');
  const data = await res.json();
  return data.results || [];
}

async function fetchLupetAnime() {
  const res = await fetch('https://apimocine.vercel.app/anime/');
  const data = await res.json();
  return data.results || [];
}

// ================== Banner ==================
function displayBanner(item) {
  const banner = document.getElementById('banner');
  if (!banner) return;

  banner.style.backgroundImage = `url(${item.poster || item.backdrop || ''})`;

  const titleEl = document.getElementById('banner-title');
  if (titleEl) titleEl.textContent = item.title || item.name;

  const overviewEl = document.getElementById('banner-overview');
  if (overviewEl) overviewEl.textContent = item.overview || '';

  const playBtn = document.getElementById('banner-play');
  if (playBtn) playBtn.onclick = () => showDetails(item, [item]);

  const listBtn = document.getElementById('banner-list');
  if (listBtn) listBtn.onclick = () => toggleMyList(item);
}

// ================== Display List ==================
function displayList(items, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  items.forEach((item, index) => {
    if (!item.poster) return;

    const img = document.createElement('img');
    img.src = item.poster;
    img.alt = item.title || item.name;
    img.classList.add('fade-in');
    img.onclick = () => showDetails(item, items, index);
    container.appendChild(img);
  });
}

// ================== Modal ==================
function showDetails(item, rowItems = [], index = 0) {
  currentItem = item;
  currentRowItems = rowItems;
  currentIndex = index;

  const modalTitle = document.getElementById('modal-title');
  if (modalTitle) modalTitle.textContent = item.title || item.name;

  const modalDesc = document.getElementById('modal-description');
  if (modalDesc) modalDesc.textContent = item.overview || '';

  const modalImg = document.getElementById('modal-image');
  if (modalImg) modalImg.src = item.poster || '';

  updateListButton(item);
  setVideoSource(item);

  const modal = document.getElementById('modal');
  if (modal) modal.style.display = 'flex';
}

// ================== Video ==================
function setVideoSource(item) {
  const server = document.getElementById('server')?.value || 'vidsrc.cc';
  const type = item.media_type || 'movie';
  let url = '';

  if (server === 'vidsrc.cc') url = `https://vidsrc.cc/v2/embed/${type}/${item.id}`;
  else if (server === 'vidsrc.me') url = `https://vidsrc.net/embed/${type}/?tmdb=${item.id}`;
  else if (server === 'player.videasy.net') url = `https://player.videasy.net/${type}/${item.id}`;

  const video = document.getElementById('modal-video');
  if (!video) return;

  video.src = url;
  video.autoplay = true;
  video.onended = playNextVideo;
}

function changeServer() {
  if (!currentItem) return;
  setVideoSource(currentItem);
}

function playNextVideo() {
  if (!currentRowItems || currentRowItems.length === 0) return;
  currentIndex = (currentIndex + 1) % currentRowItems.length;
  currentItem = currentRowItems[currentIndex];
  showDetails(currentItem, currentRowItems, currentIndex);
}

function closeModal() {
  const modal = document.getElementById('modal');
  if (modal) modal.style.display = 'none';
  const video = document.getElementById('modal-video');
  if (video) video.src = '';
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

async function searchContent() {
  const query = document.getElementById('search-input')?.value.toLowerCase();
  if (!query) {
    document.getElementById('search-results').innerHTML = '';
    return;
  }

  const movies = await fetchLupetMovies();
  const tvs = await fetchLupetTV();
  const animes = await fetchLupetAnime();
  const combined = [...movies, ...tvs, ...animes];

  const results = combined.filter(i => (i.title || i.name).toLowerCase().includes(query));

  const container = document.getElementById('search-results');
  container.innerHTML = '';

  results.forEach(item => {
    if (!item.poster) return;
    const img = document.createElement('img');
    img.src = item.poster;
    img.alt = item.title || item.name;
    img.onclick = () => {
      closeSearchModal();
      showDetails(item, [item], 0);
    };
    container.appendChild(img);
  });
}

// ================== My List ==================
function toggleMyList(item) {
  let myList = JSON.parse(localStorage.getItem('myList')) || [];
  const exists = myList.some(i => i.id === item.id);

  if (exists) myList = myList.filter(i => i.id !== item.id);
  else myList.push(item);

  localStorage.setItem('myList', JSON.stringify(myList));
  updateListButton(item);
}

function updateListButton(item) {
  const myList = JSON.parse(localStorage.getItem('myList')) || [];
  const btn = document.getElementById('add-to-list-btn');
  if (!btn) return;
  btn.textContent = myList.some(i => i.id === item.id) ? '✓ Added' : '+ Add to My List';
  btn.onclick = () => toggleMyList(item);
}

// ================== Init ==================
async function init() {
  try {
    const movies = await fetchLupetMovies();
    const tvShows = await fetchLupetTV();
    const animes = await fetchLupetAnime();

    if (movies.length > 0) displayBanner(movies[Math.floor(Math.random() * movies.length)]);
    displayList(movies, 'movies-list');
    displayList(tvShows, 'tvshows-list');
    displayList(animes, 'anime-list');
  } catch (err) {
    console.error('Error initializing content:', err);
  }
}

// Start
document.addEventListener('DOMContentLoaded', init);
