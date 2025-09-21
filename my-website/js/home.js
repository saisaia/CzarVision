/* ========= CONFIG ========= */
const API_KEY = '610f63ddc0fd1c34901a203b7eea62cc';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/original';
let currentItem = null;

/* ========= UTIL ========= */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const safeText = (s) => s || '—';

/* debounce */
function debounce(fn, wait = 300) {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), wait); };
}

/* IntersectionObserver for lazy images */
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const img = e.target;
      if (img.dataset.src) img.src = img.dataset.src;
      io.unobserve(img);
    }
  });
}, { rootMargin: '200px' });

/* ========= TMDB HELPERS ========= */
async function tmdbFetch(path) {
  const res = await fetch(`${BASE_URL}${path}&api_key=${API_KEY}`);
  if (!res.ok) throw new Error('TMDB fetch failed');
  return res.json();
}

async function fetchTrending(type) {
  const json = await tmdbFetch(`/trending/${type}/week?`);
  return json.results || [];
}

async function fetchTrendingAnime() {
  let allResults = [];
  for (let page = 1; page <= 3; page++) {
    const json = await tmdbFetch(`/trending/tv/week?&page=${page}`);
    const filtered = (json.results || []).filter(it => it.original_language === 'ja' && (it.genre_ids || []).includes(16));
    allResults = allResults.concat(filtered);
  }
  return allResults;
}

/* ========= RENDER ========= */
function setBanner(item) {
  const banner = $('#banner');
  if (!item || !item.backdrop_path) {
    banner.style.background = `linear-gradient(180deg,#0b0b0b,#070707)`;
    $('#banner-title').textContent = 'CzarVision';
    $('#banner-year').textContent = '';
    $('#banner-rating').textContent = '';
    return;
  }
  banner.style.backgroundImage = `url(${IMG_URL}${item.backdrop_path})`;
  $('#banner-title').textContent = item.title || item.name;
  $('#banner-year').textContent = (item.release_date || item.first_air_date || '').slice(0,4);
  $('#banner-rating').textContent = item.vote_average ? `★ ${item.vote_average.toFixed(1)}` : '';
}

function makeCard(item) {
  const div = document.createElement('div');
  div.className = 'card';
  const img = document.createElement('img');
  img.alt = safeText(item.title || item.name);
  if (item.poster_path) img.dataset.src = IMG_URL + item.poster_path;
  else img.src = 'placeholder.png'; // optional fallback if you have one
  img.loading = 'lazy';
  img.addEventListener('click', () => showDetails(item));
  div.appendChild(img);
  const t = document.createElement('div');
  t.className = 'title';
  t.textContent = item.title || item.name || 'Untitled';
  div.appendChild(t);

  // start observing for lazy load
  if (img.dataset.src) io.observe(img);
  return div;
}

function renderList(items, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  if (!items || items.length === 0) {
    container.innerHTML = `<div style="color:var(--muted);padding:12px">No results</div>`;
    return;
  }
  items.forEach(it => container.appendChild(makeCard(it)));
}

/* ========= MODAL / PLAYER ========= */
function showDetails(item) {
  currentItem = item;
  $('#modal-title').textContent = item.title || item.name || 'Untitled';
  $('#modal-description').textContent = item.overview || 'No description available.';
  $('#modal-image').src = item.poster_path ? `${IMG_URL}${item.poster_path}` : '';
  $('#modal-rating').textContent = item.vote_average ? '★'.repeat(Math.round(item.vote_average / 2)) : '';
  changeServer(); // set iframe for default server
  $('#modal').classList.add('show');
  $('#modal').setAttribute('aria-hidden', 'false');
}

function closeModal() {
  $('#modal').classList.remove('show');
  $('#modal').setAttribute('aria-hidden', 'true');
  $('#modal-video').src = '';
}

function changeServer() {
  if (!currentItem) return;
  const server = $('#server').value;
  const type = currentItem.media_type === 'movie' ? 'movie' : 'tv';
  let embed = '';
  if (server === 'vidsrc.cc') embed = `https://vidsrc.cc/v2/embed/${type}/${currentItem.id}`;
  else if (server === 'vidsrc.me') embed = `https://vidsrc.net/embed/${type}/?tmdb=${currentItem.id}`;
  else if (server === 'player.videasy.net') embed = `https://player.videasy.net/${type}/${currentItem.id}`;
  $('#modal-video').src = embed;
}

/* ========= SEARCH ========= */
async function searchTMDB() {
  const q = $('#search-input').value.trim();
  const results = $('#search-results');
  results.innerHTML = '';
  if (!q) return;
  // skeleton
  results.innerHTML = Array.from({length:8}).map(()=>`<div class="result" style="height:160px;border-radius:8px;background:linear-gradient(90deg,rgba(255,255,255,0.02),rgba(255,255,255,0.04),rgba(255,255,255,0.02));"></div>`).join('');
  try {
    const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(q)}`);
    const data = await res.json();
    const arr = (data.results || []).filter(r => r.poster_path).slice(0,24);
    results.innerHTML = '';
    arr.forEach(it => {
      const el = document.createElement('div'); el.className = 'result';
      const img = document.createElement('img');
      img.src = `${IMG_URL}${it.poster_path}`;
      img.alt = it.title || it.name;
      img.addEventListener('click', () => { closeSearchModal(); showDetails(it); });
      el.appendChild(img);
      results.appendChild(el);
    });
    if (arr.length === 0) results.innerHTML = `<div style="padding:12px;color:var(--muted)">No matches</div>`;
  } catch (err) {
    results.innerHTML = `<div style="padding:12px;color:var(--muted)">Search failed</div>`;
    console.error(err);
  }
}
const debouncedSearch = debounce(searchTMDB, 320);

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

/* ========= INIT ========= */
async function init() {
  try {
    const [movies, tv, anime] = await Promise.all([
      fetchTrending('movie'),
      fetchTrending('tv'),
      fetchTrendingAnime()
    ]);
    if (movies && movies.length) setBanner(movies[Math.floor(Math.random() * movies.length)]);
    renderList(movies.slice(0,24), 'movies-list');
    renderList(tv.slice(0,24), 'tvshows-list');
    renderList(anime.slice(0,24), 'anime-list');
  } catch (err) {
    console.error('Init failed', err);
  }
}

/* ========= EVENTS ========= */
document.addEventListener('keydown', e => {
  if (e.key === '/') { e.preventDefault(); openSearchModal(); }
  if (e.key === 'Escape') { closeModal(); closeSearchModal(); }
});

$('#search-open').addEventListener('click', openSearchModal);
$('#search-close').addEventListener('click', closeSearchModal);
$('#modal-close').addEventListener('click', closeModal);
$('#search-input').addEventListener('input', debouncedSearch);
$('#server').addEventListener('change', changeServer);

// click outside modal content closes it
$('#modal').addEventListener('click', (ev) => {
  if (ev.target === $('#modal')) closeModal();
});
$('#search-modal').addEventListener('click', (ev) => {
  if (ev.target === $('#search-modal')) closeSearchModal();
});

// Banner CTA - open top modal item if available
$('#banner-play').addEventListener('click', () => {
  // attempt to open details of currently shown banner item by reading title match
  const title = $('#banner-title').textContent;
  const lists = [...$$('.card')];
  const match = lists.find(c => c.querySelector('.title') && c.querySelector('.title').textContent.trim() === title.trim());
  if (match) match.click();
});

init();
