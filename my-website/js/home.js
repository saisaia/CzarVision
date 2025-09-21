/* ================= CONFIG ================= */
const API_KEY = '610f63ddc0fd1c34901a203b7eea62cc';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/original';

let currentItem = null;
let bannerItem = null;

/* ================ HELPERS ================ */
const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));
const safe = (v, fallback = '—') => v || fallback;

function debounce(fn, wait = 300) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
}

/* IntersectionObserver for lazy loading posters */
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const img = e.target;
      if (img.dataset.src) img.src = img.dataset.src;
      io.unobserve(img);
    }
  });
}, { rootMargin: '200px' });

/* Safe TMDB fetch - pass path like '/trending/movie/week' and optional params */
async function tmdbFetch(path, params = {}) {
  const url = new URL(BASE_URL + path);
  params.api_key = API_KEY;
  url.search = new URLSearchParams(params).toString();
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
  return res.json();
}

/* =============== DATA LOADERS =============== */
async function fetchTrending(type) {
  const json = await tmdbFetch(`/trending/${type}/week`);
  return json.results || [];
}

async function fetchTrendingAnime() {
  let results = [];
  for (let page = 1; page <= 3; page++) {
    const json = await tmdbFetch('/trending/tv/week', { page });
    const filtered = (json.results || []).filter(it => it.original_language === 'ja' && (it.genre_ids || []).includes(16));
    results = results.concat(filtered);
  }
  return results;
}

/* =============== RENDERERS =============== */
function setBanner(item) {
  bannerItem = item;
  const banner = $('#banner');
  if (!item || !item.backdrop_path) {
    banner.style.backgroundImage = '';
    $('#banner-title').textContent = 'CzarVision';
    $('#banner-year').textContent = '';
    $('#banner-rating').textContent = '';
    return;
  }
  banner.style.backgroundImage = `url(${IMG_URL}${item.backdrop_path})`;
  $('#banner-title').textContent = item.title || item.name || 'Featured';
  $('#banner-year').textContent = (item.release_date || item.first_air_date || '').slice(0,4);
  $('#banner-rating').textContent = item.vote_average ? `★ ${item.vote_average.toFixed(1)}` : '';
}

/* create card element */
function makeCard(item) {
  const wrap = document.createElement('div');
  wrap.className = 'card';
  const img = document.createElement('img');
  img.alt = safe(item.title || item.name, 'Poster');
  if (item.poster_path) img.dataset.src = IMG_URL + item.poster_path;
  else img.src = '';
  img.loading = 'lazy';
  img.addEventListener('click', () => showDetails(item));
  wrap.appendChild(img);

  const t = document.createElement('div');
  t.className = 'title';
  t.textContent = item.title || item.name || 'Untitled';
  wrap.appendChild(t);

  if (img.dataset.src) io.observe(img);
  return wrap;
}

function renderList(items, containerId) {
  const c = $(`#${containerId}`);
  c.innerHTML = '';
  if (!items || items.length === 0) {
    c.innerHTML = `<div style="color:var(--muted);padding:12px">No results</div>`;
    return;
  }
  items.forEach(it => c.appendChild(makeCard(it)));
}

/* =============== MODAL / PLAYER =============== */
function showDetails(item) {
  currentItem = item;
  $('#modal-title').textContent = item.title || item.name || 'Untitled';
  $('#modal-description').textContent = item.overview || 'No description available.';
  $('#modal-image').src = item.poster_path ? `${IMG_URL}${item.poster_path}` : '';
  $('#modal-rating').textContent = item.vote_average ? '★'.repeat(Math.round(item.vote_average / 2)) : '';
  changeServer(); // set iframe by default server
  $('#modal').classList.add('show');
  $('#modal').setAttribute('aria-hidden', 'false');
}

function closeModal() {
  $('#modal').classList.remove('show');
  $('#modal').setAttribute('aria-hidden', 'true');
  $('#modal-video').src = '';
}

/* pick type: prefer explicit media_type else fallback from fields */
function getMediaType(item) {
  if (!item) return 'movie';
  if (item.media_type) return item.media_type;
  return item.release_date ? 'movie' : 'tv';
}

function changeServer() {
  if (!currentItem) return;
  const server = $('#server').value;
  const type = getMediaType(currentItem);
  let embed = '';
  if (server === 'vidsrc.cc') embed = `https://vidsrc.cc/v2/embed/${type}/${currentItem.id}`;
  else if (server === 'vidsrc.me') embed = `https://vidsrc.net/embed/${type}/?tmdb=${currentItem.id}`;
  else if (server === 'player.videasy.net') embed = `https://player.videasy.net/${type}/${currentItem.id}`;
  $('#modal-video').src = embed;
}

/* =============== SEARCH =============== */
async function searchTMDB() {
  const q = $('#search-input').value.trim();
  const results = $('#search-results');
  results.innerHTML = '';
  if (!q) return;
  // show skeletons
  results.innerHTML = Array.from({length:8}).map(()=>`<div class="result" style="height:160px;border-radius:8px;background:linear-gradient(90deg,rgba(255,255,255,0.02),rgba(255,255,255,0.04),rgba(255,255,255,0.02));"></div>`).join('');
  try {
    const json = await tmdbFetch('/search/multi', { query: q, page: 1 });
    const arr = (json.results || []).filter(r => r.poster_path).slice(0,24);
    results.innerHTML = '';
    if (arr.length === 0) {
      results.innerHTML = `<div style="padding:12px;color:var(--muted)">No matches</div>`;
      return;
    }
    arr.forEach(it => {
      const el = document.createElement('div');
      el.className = 'result';
      const img = document.createElement('img');
      img.src = `${IMG_URL}${it.poster_path}`;
      img.alt = it.title || it.name;
      img.addEventListener('click', () => {
        closeSearchModal();
        showDetails(it);
      });
      el.appendChild(img);
      results.appendChild(el);
    });
  } catch (err) {
    console.error(err);
    results.innerHTML = `<div style="padding:12px;color:var(--muted)">Search failed</div>`;
  }
}
const debouncedSearch = debounce(searchTMDB, 320);

/* =============== INIT =============== */
async function init() {
  try {
    const [movies, tv, anime] = await Promise.all([
      fetchTrending('movie'),
      fetchTrending('tv'),
      fetchTrendingAnime()
    ]);
    if (movies && movies.length) setBanner(movies[Math.floor(Math.random()*movies.length)]);
    renderList(movies.slice(0,24), 'movies-list');
    renderList(tv.slice(0,24), 'tvshows-list');
    renderList(anime.slice(0,24), 'anime-list');
  } catch (err) {
    console.error('Init failed', err);
  }
}

/* =============== EVENTS =============== */
document.addEventListener('DOMContentLoaded', () => {
  // buttons
  $('#search-open').addEventListener('click', openSearchModal);
  $('#search-close').addEventListener('click', closeSearchModal);
  $('#modal-close').addEventListener('click', closeModal);

  // modal background click
  $('#modal').addEventListener('click', (ev) => { if (ev.target === $('#modal')) closeModal(); });
  $('#search-modal').addEventListener('click', (ev) => { if (ev.target === $('#search-modal')) closeSearchModal(); });

  // search input
  $('#search-input').addEventListener('input', debouncedSearch);

  // server change
  $('#server').addEventListener('change', changeServer);

  // keyboard
  document.addEventListener('keydown', (e) => {
    if (e.key === '/') { e.preventDefault(); openSearchModal(); }
    if (e.key === 'Escape') { closeModal(); closeSearchModal(); }
  });

  // banner play button opens details for banner item
  $('#banner-play').addEventListener('click', () => {
    if (bannerItem) showDetails(bannerItem);
  });

  // start
  init();
});

/* =============== UI helpers =============== */
function openSearchModal() {
  $('#search-modal').classList.add('show');
  $('#search-modal').setAttribute('aria-hidden','false');
  $('#search-input').focus();
}
function closeSearchModal() {
  $('#search-modal').classList.remove('show');
  $('#search-modal').setAttribute('aria-hidden','true');
  $('#search-results').innerHTML = '';
  $('#search-input').value = '';
}
