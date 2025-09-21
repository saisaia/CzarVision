// ================== API CONFIG ==================
const API_KEY = 'a1e72fd93ed59f56e6332813b9f8dcae';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/original';

let currentItem = null;
let bannerItems = [];
let bannerIndex = 0;

// ================== FETCH HELPERS ==================
async function fetchData(url) {
  const res = await fetch(url);
  return res.json();
}

async function fetchTrending(type) {
  const data = await fetchData(`${BASE_URL}/trending/${type}/week?api_key=${API_KEY}`);
  return data.results;
}

async function fetchByGenre(genreId) {
  const data = await fetchData(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}`);
  return data.results;
}

async function fetchAnime() {
  const data = await fetchData(`${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=16&with_original_language=ja`);
  return data.results;
}

// ================== DISPLAY FUNCTIONS ==================
function displayBanner(item) {
  const banner = document.getElementById('banner');
  const title = document.getElementById('banner-title');

  if (item && item.backdrop_path) {
    banner.style.backgroundImage = `url(${IMG_URL}${item.backdrop_path})`;
    title.textContent = item.title || item.name;
  }
}

function rotateBanner() {
  if (bannerItems.length === 0) return;
  displayBanner(bannerItems[bannerIndex]);
  bannerIndex = (bannerIndex + 1) % bannerItems.length;
}

function displayList(items, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  items.forEach(item => {
    if (!item.poster_path) return;
    const img = document.createElement('img');
    img.src = `${IMG_URL}${item.poster_path}`;
    img.alt = item.title || item.name;
    img.loading = 'lazy';
    img.onclick = () => showDetails(item);
    container.appendChild(img);
  });
}

// ================== MODAL ==================
async function showDetails(item) {
  currentItem = item;

  document.getElementById('modal-title').textContent = item.title || item.name;
  document.getElementById('modal-description').textContent = item.overview || 'No description available.';
  document.getElementById('modal-image').src = `${IMG_URL}${item.poster_path}`;
  document.getElementById('modal-rating').innerHTML = '★'.repeat(Math.round(item.vote_average / 2));

  await changeServer();
  document.getElementById('modal').style.display = 'flex';
}

async function changeServer() {
  if (!currentItem) return;
  const server = document.getElementById('server').value;
  const type = currentItem.media_type === 'movie' ? 'movie' : 'tv';
  let embedURL = '';

  if (server === 'vidsrc.cc') {
    embedURL = `https://vidsrc.cc/v2/embed/${type}/${currentItem.id}`;
  } else if (server === 'vidsrc.me') {
    embedURL = `https://vidsrc.net/embed/${type}/?tmdb=${currentItem.id}`;
  } else if (server === 'player.videasy.net') {
    embedURL = `https://player.videasy.net/${type}/${currentItem.id}`;
  }

  document.getElementById('modal-video').src = embedURL;
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
  document.getElementById('modal-video').src = '';
}

// ================== TRAILERS ==================
async function watchTrailer() {
  if (!currentItem) return;
  const type = currentItem.media_type === 'movie' ? 'movie' : 'tv';
  const data = await fetchData(`${BASE_URL}/${type}/${currentItem.id}/videos?api_key=${API_KEY}`);
  const trailer = data.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
  if (trailer) {
    window.open(`https://www.youtube.com/watch?v=${trailer.key}`, '_blank');
  } else {
    alert('Trailer not available.');
  }
}

// ================== WATCHLIST ==================
function toggleWatchlist() {
  if (!currentItem) return;
  let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
  const exists = watchlist.find(i => i.id === currentItem.id);

  if (exists) {
    watchlist = watchlist.filter(i => i.id !== currentItem.id);
    alert('Removed from My List');
  } else {
    watchlist.push(currentItem);
    alert('Added to My List');
  }

  localStorage.setItem('watchlist', JSON.stringify(watchlist));
}

// ================== SEARCH ==================
function openSearchModal() {
  document.getElementById('search-modal').style.display = 'flex';
  document.getElementById('search-input').focus();
}

function closeSearchModal() {
  document.getElementById('search-modal').style.display = 'none';
  document.getElementById('search-results').innerHTML = '';
}

async function searchTMDB() {
  const query = document.getElementById('search-input').value;
  if (!query.trim()) return;

  const data = await fetchData(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${query}`);
  const container = document.getElementById('search-results');
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

// ================== THEME TOGGLE ==================
function toggleTheme() {
  document.body.classList.toggle('light-mode');
}

// ================== SIDEBAR ==================
function toggleMenu() {
  const sidebar = document.getElementById('sidebar');
  sidebar.style.width = sidebar.style.width === '250px' ? '0' : '250px';
}

// ================== KEYBOARD SHORTCUTS ==================
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeModal();
    closeSearchModal();
  }
  if (e.key === 'ArrowRight') {
    document.querySelectorAll('.list').forEach(list => list.scrollBy(200, 0));
  }
  if (e.key === 'ArrowLeft') {
    document.querySelectorAll('.list').forEach(list => list.scrollBy(-200, 0));
  }
});

// ================== INIT ==================
async function init() {
  // Show loader
  document.getElementById('loader').style.display = 'flex';

  const trending = await fetchTrending('movie');
  const action = await fetchByGenre(28);
  const comedy = await fetchByGenre(35);
  const horror = await fetchByGenre(27);
  const romance = await fetchByGenre(10749);
  const scifi = await fetchByGenre(878);
  const anime = await fetchAnime();

  // Store for banner rotation
  bannerItems = trending.slice(0, 5);
  rotateBanner();
  setInterval(rotateBanner, 10000);

  // Display lists
  displayList(trending, 'trending-list');
  displayList(action, 'action-list');
  displayList(comedy, 'comedy-list');
  displayList(horror, 'horror-list');
  displayList(romance, 'romance-list');
  displayList(scifi, 'scifi-list');
  displayList(anime, 'anime-list');

  // Hide loader
  document.getElementById('loader').style.display = 'none';
}

init();
