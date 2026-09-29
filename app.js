const image = (id, width = 720) => id.startsWith('https://') ? id : `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=82`;
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const demoVideo = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
const isGitHubPages = window.NOVAFLIX_STATIC_MODE === true;

const titles = [
  { id: 'la-ultima-luz', name: 'La última luz del norte', genre: 'Drama · Misterio', kind: 'Series', year: '2025', score: '98%', age: '16+', length: '1 temporada', label: 'NOVA ORIGINAL', image: 'photo-1511497584788-876760111969', description: 'Cuando una señal imposible despierta bajo el hielo, una cartógrafa vuelve al pueblo que juró olvidar. Hay lugares que nunca dejan de llamarte.' },
  { id: 'mar-abierto', name: 'Mar abierto', genre: 'Drama · Aventura', kind: 'Películas', year: '2024', score: '95%', age: '13+', length: '1 h 48 min', label: 'TOP 10', image: 'photo-1518837695005-2083093ee35b', description: 'Dos hermanas emprenden el viaje que su madre dejó inconcluso y descubren que el horizonte guarda más que respuestas.' },
  { id: 'frecuencia-cero', name: 'Frecuencia cero', genre: 'Ciencia ficción · Misterio', kind: 'Series', year: '2025', score: '97%', age: '16+', length: '2 temporadas', label: 'NUEVA TEMPORADA', image: 'photo-1519608487953-e999c86e7455', description: 'Cada noche, a las 02:17, una voz transmite desde un futuro que todavía no existe.' },
  { id: 'casa-sal', name: 'La casa de sal', genre: 'Drama · Suspense', kind: 'Películas', year: '2024', score: '92%', age: '16+', length: '1 h 56 min', label: '', image: 'photo-1518005020951-eccb494ad742', description: 'Una arquitecta hereda una casa imposible y las cartas de una familia que nadie recuerda.' },
  { id: 'verde-profundo', name: 'Verde profundo', genre: 'Naturaleza · Documental', kind: 'Series', year: '2025', score: '99%', age: '7+', length: '1 temporada', label: 'NOVA ORIGINAL', image: 'photo-1448375240586-882707db888b', description: 'Un viaje íntimo por los bosques más antiguos y los seres que aprendieron a vivir en ellos.' },
  { id: 'ciudad-dormida', name: 'La ciudad dormida', genre: 'Ciencia ficción · Drama', kind: 'Películas', year: '2023', score: '91%', age: '13+', length: '2 h 04 min', label: '', image: 'photo-1519608487953-e999c86e7455', description: 'En una ciudad donde nadie sueña, una estudiante empieza a recordar vidas que no son suyas.' },
  { id: 'ultimo-verano', name: 'El último verano', genre: 'Drama · Romance', kind: 'Series', year: '2024', score: '96%', age: '13+', length: '1 temporada', label: 'TENDENCIA', image: 'photo-1473116763249-2faaef81ccda', description: 'Un pequeño hotel junto al lago reúne a desconocidos en el verano que ninguno olvidará.' },
  { id: 'orbita', name: 'Órbita 9', genre: 'Ciencia ficción · Aventura', kind: 'Películas', year: '2025', score: '94%', age: '13+', length: '1 h 52 min', label: 'ESTRENO', image: 'photo-1446776811953-b23d57bd21aa', description: 'Una misión de rescate descubre que la nave perdida sigue enviando señales desde algún lugar.' },
  { id: 'hijas-viento', name: 'Hijas del viento', genre: 'Drama · Historia', kind: 'Series', year: '2023', score: '93%', age: '16+', length: '2 temporadas', label: '', image: 'photo-1470252649378-9c29740c9fa8', description: 'Tres generaciones, una isla y un secreto que cambia de nombre con cada marea.' },
  { id: 'linea-fantasma', name: 'Línea fantasma', genre: 'Suspense · Misterio', kind: 'Películas', year: '2025', score: '90%', age: '16+', length: '1 h 39 min', label: 'NOVA ORIGINAL', image: 'photo-1519608487953-e999c86e7455', description: 'Una operadora nocturna recibe llamadas de pasajeros de un tren que dejó de existir hace veinte años.' },
  { id: 'ultima-parada', name: 'La última parada', genre: 'Drama · Aventura', kind: 'Películas', year: '2025', score: '96%', age: '13+', length: '1 h 51 min', label: 'ESTRENO', image: 'photo-1473448912268-2022ce9509d8', description: 'Un tren detenido en mitad del bosque cambia el rumbo de seis desconocidos.' },
  { id: 'atlas-azul', name: 'El atlas azul', genre: 'Aventura · Misterio', kind: 'Películas', year: '2024', score: '94%', age: '7+', length: '1 h 43 min', label: '', image: 'photo-1500530855697-b586d89ba3ee', description: 'Una joven encuentra un mapa que señala lugares que todavía no existen.' },
  { id: 'despues-lluvia', name: 'Después de la lluvia', genre: 'Drama · Romance', kind: 'Películas', year: '2025', score: '97%', age: '13+', length: '1 h 57 min', label: 'NOVA ORIGINAL', image: 'photo-1519608487953-e999c86e7455', description: 'Dos viejos amigos vuelven a su ciudad costera para empezar de nuevo.' },
  { id: 'planeta-silencio', name: 'Planeta silencio', genre: 'Ciencia ficción · Aventura', kind: 'Películas', year: '2024', score: '95%', age: '13+', length: '2 h 02 min', label: 'TOP 10', image: 'photo-1462331940025-496dfbfc7564', description: 'La tripulación de una nave explora un planeta donde el sonido desaparece.' },
  { id: 'jardin-secreto', name: 'El jardín secreto', genre: 'Drama · Misterio', kind: 'Películas', year: '2023', score: '92%', age: '7+', length: '1 h 46 min', label: '', image: 'photo-1441974231531-c6227db76b6e', description: 'Una restauradora descubre un jardín oculto y las historias que guarda.' },
  { id: 'noche-de-cristal', name: 'Noche de cristal', genre: 'Suspense · Drama', kind: 'Películas', year: '2025', score: '91%', age: '16+', length: '1 h 42 min', label: 'NUEVA', image: 'photo-1519608487953-e999c86e7455', description: 'Una fotógrafa revela por accidente una imagen que alguien quería mantener oculta.' },
];

const grid = document.querySelector('#movie-grid');
const input = document.querySelector('#search-input');
const emptyState = document.querySelector('#empty-state');
const dialog = document.querySelector('#detail-dialog');
const playerDialog = document.querySelector('#player-dialog');
const videoPlayer = document.querySelector('#movie-player');
const accountDialog = document.querySelector('#account-dialog');
const accountForm = document.querySelector('#account-form');
const adminDialog = document.querySelector('#admin-dialog');
const movieForm = document.querySelector('#movie-form');
const saved = new Set(JSON.parse(localStorage.getItem('novaflix-list') || '[]'));
let activeCategory = 'Todo';
let currentUser = null;
let authMode = 'login';

async function api(path, options = {}) {
  let response;
  try {
    response = await fetch(path, { credentials: 'same-origin', ...options, headers: { 'Content-Type': 'application/json', ...options.headers } });
  } catch {
    throw new Error('No se pudo conectar con Novaflix. Inícialo con «node server.js» y abre http://localhost:8000.');
  }
  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error('El servidor respondió en un formato inesperado. Abre Novaflix desde http://localhost:8000, no desde Live Server.');
  }
  if (!response.ok) throw new Error(result.error || 'No se pudo completar la solicitud.');
  return result;
}

function matchesCategory(title) {
  if (activeCategory === 'Todo') return true;
  if (activeCategory === 'Mi lista') return saved.has(title.id);
  if (activeCategory === 'Drama' || activeCategory === 'Ciencia ficción') return title.genre.includes(activeCategory);
  return title.kind === activeCategory;
}

function renderCatalog() {
  const term = input.value.trim().toLocaleLowerCase('es');
  const filtered = titles.filter((title) => matchesCategory(title) && `${title.name} ${title.genre} ${title.kind}`.toLocaleLowerCase('es').includes(term));
  grid.innerHTML = filtered.map((title, index) => `
    <article class="movie-card" data-title="${title.id}" style="animation-delay:${Math.min(index * 45, 270)}ms">
      <div class="poster-wrap">
        <img src="${escapeHtml(image(title.image))}" alt="" loading="lazy">
        ${title.label ? `<span class="poster-label">${escapeHtml(title.label)}</span>` : ''}
        <span class="card-play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m8 5 11 7-11 7z"></path></svg></span>
      </div>
      <div class="card-info">
        <div class="card-title-row"><h3 class="card-title">${escapeHtml(title.name)}</h3><button class="card-save ${saved.has(title.id) ? 'is-saved' : ''}" data-save="${title.id}" aria-label="${saved.has(title.id) ? 'Quitar de' : 'Añadir a'} Mi lista">${saved.has(title.id) ? '✓' : '+'}</button></div>
        <p class="card-subtitle">${escapeHtml(title.kind)}<span>·</span>${escapeHtml(title.year)}<span>·</span>${escapeHtml(title.score)}</p>
      </div>
    </article>`).join('');
  emptyState.hidden = filtered.length > 0;
  grid.hidden = filtered.length === 0;
  document.querySelector('#result-count').textContent = `${filtered.length} títulos`;
  document.querySelectorAll('.list-count').forEach((count) => { count.textContent = saved.size; });
}

async function toggleSaved(id) {
  if (currentUser) {
    try {
      const result = await api('/api/watchlist', { method: 'POST', body: JSON.stringify({ titleId: id }) });
      saved.clear();
      result.watchlist.forEach((titleId) => saved.add(titleId));
    } catch (error) {
      showAuthError(error.message);
      accountDialog.showModal();
      return;
    }
  } else {
    saved.has(id) ? saved.delete(id) : saved.add(id);
    localStorage.setItem('novaflix-list', JSON.stringify([...saved]));
  }
  renderCatalog();
  if (dialog.open && dialog.dataset.title === id) updateDialogSaved(id);
}

function updateDialogSaved(id) {
  const button = dialog.querySelector('.list-button');
  const isSaved = saved.has(id);
  button.classList.toggle('is-saved', isSaved);
  button.innerHTML = `<span>${isSaved ? '✓' : '+'}</span> ${isSaved ? 'En mi lista' : 'Mi lista'}`;
}

function openDetails(id) {
  const title = titles.find((item) => item.id === id);
  if (!title) return;
  dialog.dataset.title = id;
  dialog.querySelector('#dialog-title').textContent = title.name;
  dialog.querySelector('#dialog-art').style.backgroundImage = `url('${image(title.image, 1100)}')`;
  dialog.querySelector('.dialog-meta').innerHTML = `<span class="match">${escapeHtml(title.score)} para ti</span><span>${escapeHtml(title.year)}</span><span>${escapeHtml(title.age)}</span><span>${escapeHtml(title.length)}</span>`;
  dialog.querySelector('.dialog-description').textContent = title.description;
  dialog.querySelector('.dialog-tags').innerHTML = title.genre.split(' · ').map((genre) => `<span>${escapeHtml(genre)}</span>`).join('');
  updateDialogSaved(id);
  dialog.showModal();
}

function playTitle(id) {
  const title = titles.find((item) => item.id === id);
  if (!title) return;
  document.querySelector('#player-title').textContent = title.name;
  videoPlayer.src = title.videoUrl || demoVideo;
  videoPlayer.poster = image(title.image, 1200);
  videoPlayer.load();
  videoPlayer.currentTime = 0;
  playerDialog.showModal();
  videoPlayer.play().catch(() => {});
}

function showAuthError(message = '') {
  const error = document.querySelector('#auth-error');
  error.textContent = message;
  error.hidden = !message;
}

function renderAccount() {
  const isLoggedIn = Boolean(currentUser);
  document.querySelector('#account-form').hidden = isLoggedIn || isGitHubPages;
  document.querySelector('#account-profile').hidden = !isLoggedIn || isGitHubPages;
  document.querySelector('#pages-account-note').hidden = !isGitHubPages;
  document.querySelector('.account-intro').hidden = isGitHubPages;
  document.querySelector('.account-footnote').hidden = isGitHubPages;
  document.querySelector('#account-name').textContent = currentUser?.name || '';
  document.querySelector('#account-email').textContent = currentUser?.email || '';
  document.querySelector('#account-role').textContent = currentUser?.role === 'admin' ? 'Administrador' : 'Cuenta estándar';
  document.querySelector('#admin-open').hidden = currentUser?.role !== 'admin';
  const avatar = document.querySelector('#account-button');
  avatar.textContent = isLoggedIn ? currentUser.name.charAt(0).toLocaleUpperCase('es') : 'Entrar';
  avatar.classList.toggle('is-logged-in', isLoggedIn);
  avatar.setAttribute('aria-label', isLoggedIn ? `Cuenta de ${currentUser.name}` : 'Abrir cuenta');
}

function setAuthMode(mode) {
  authMode = mode;
  const registering = mode === 'register';
  document.querySelector('.name-field').hidden = !registering;
  document.querySelector('.name-field input').required = registering;
  document.querySelector('[name="password"]').autocomplete = registering ? 'new-password' : 'current-password';
  document.querySelector('.auth-submit').textContent = registering ? 'Crear cuenta' : 'Iniciar sesión';
  document.querySelectorAll('.auth-tab').forEach((tab) => tab.classList.toggle('is-active', tab.dataset.authMode === mode));
  showAuthError();
}

async function loadAccount() {
  if (isGitHubPages) {
    renderAccount();
    return;
  }
  try {
    const result = await api('/api/me');
    currentUser = result.user;
    if (currentUser) {
      saved.clear();
      result.watchlist.forEach((id) => saved.add(id));
    }
    renderAccount();
    renderCatalog();
  } catch {
    renderAccount();
  }
}

async function loadMovies() {
  try {
    let movies;
    if (isGitHubPages) {
      const response = await fetch(new URL('data/movies.json', document.baseURI));
      if (!response.ok) throw new Error('No se pudo cargar el catálogo público.');
      movies = await response.json();
    } else {
      const result = await api('/api/movies');
      movies = result.movies;
    }
    if (Array.isArray(movies)) {
      titles.unshift(...movies);
      renderCatalog();
    }
  } catch {}
}

document.querySelectorAll('.filter-chip').forEach((button) => button.addEventListener('click', () => {
  activeCategory = button.dataset.category;
  document.querySelectorAll('.filter-chip').forEach((chip) => chip.classList.toggle('is-selected', chip === button));
  document.querySelector('#shelf-title').textContent = activeCategory === 'Todo' ? 'Tu próxima historia' : activeCategory === 'Mi lista' ? 'Tu lista' : activeCategory;
  renderCatalog();
}));

document.querySelectorAll('.nav-link').forEach((link) => link.addEventListener('click', () => {
  document.querySelectorAll('.nav-link').forEach((item) => item.classList.toggle('is-active', item === link));
  if (link.dataset.filter) {
    const chip = document.querySelector(`[data-category="${link.dataset.filter}"]`);
    chip?.click();
  } else {
    document.querySelector('[data-category="Todo"]').click();
  }
}));

input.addEventListener('input', renderCatalog);
grid.addEventListener('click', (event) => {
  const saveButton = event.target.closest('[data-save]');
  if (saveButton) {
    event.stopPropagation();
    toggleSaved(saveButton.dataset.save);
    return;
  }
  const card = event.target.closest('[data-title]');
  if (card) openDetails(card.dataset.title);
});

document.querySelector('[data-details="la-ultima-luz"]').addEventListener('click', () => openDetails('la-ultima-luz'));
document.querySelector('[data-play="la-ultima-luz"]').addEventListener('click', () => playTitle('la-ultima-luz'));
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
dialog.querySelector('.list-button').addEventListener('click', () => toggleSaved(dialog.dataset.title));
dialog.querySelector('.dialog-play').addEventListener('click', () => {
  const id = dialog.dataset.title;
  dialog.close();
  playTitle(id);
});
document.querySelector('#account-button').addEventListener('click', () => { showAuthError(); accountDialog.showModal(); });
document.querySelector('.account-close').addEventListener('click', () => accountDialog.close());
document.querySelector('#admin-open').addEventListener('click', () => {
  accountDialog.close();
  document.querySelector('#admin-error').hidden = true;
  adminDialog.showModal();
});
document.querySelector('.admin-close').addEventListener('click', () => adminDialog.close());
movieForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const errorElement = document.querySelector('#admin-error');
  errorElement.hidden = true;
  const data = new FormData(movieForm);
  const payload = Object.fromEntries(data.entries());
  try {
    const result = await api('/api/movies', { method: 'POST', body: JSON.stringify(payload) });
    titles.unshift(result.movie);
    renderCatalog();
    movieForm.reset();
    adminDialog.close();
  } catch (error) {
    errorElement.textContent = error.message;
    errorElement.hidden = false;
  }
});
document.querySelectorAll('.auth-tab').forEach((tab) => tab.addEventListener('click', () => setAuthMode(tab.dataset.authMode)));
accountForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  showAuthError();
  const formData = new FormData(accountForm);
  const payload = { email: formData.get('email'), password: formData.get('password') };
  if (authMode === 'register') payload.name = formData.get('name');
  try {
    const result = await api(`/api/${authMode}`, { method: 'POST', body: JSON.stringify(payload) });
    currentUser = result.user;
    saved.clear();
    result.watchlist.forEach((id) => saved.add(id));
    renderAccount();
    renderCatalog();
    accountForm.reset();
    accountDialog.close();
  } catch (error) {
    showAuthError(error.message);
  }
});
document.querySelector('#logout-button').addEventListener('click', async () => {
  try {
    await api('/api/logout', { method: 'POST', body: '{}' });
    currentUser = null;
    saved.clear();
    localStorage.removeItem('novaflix-list');
    renderAccount();
    renderCatalog();
    accountDialog.close();
  } catch (error) {
    showAuthError(error.message);
  }
});
document.querySelector('.player-close').addEventListener('click', () => playerDialog.close());
playerDialog.addEventListener('close', () => { videoPlayer.pause(); videoPlayer.currentTime = 0; });
document.querySelectorAll('[data-scroll]').forEach((button) => button.addEventListener('click', () => {
  grid.scrollBy({ left: Number(button.dataset.scroll) * Math.max(grid.clientWidth * .8, 240), behavior: 'smooth' });
}));
document.querySelector('.sound-toggle').addEventListener('click', (event) => {
  const button = event.currentTarget;
  const enabled = button.getAttribute('aria-label') === 'Activar sonido';
  button.setAttribute('aria-label', enabled ? 'Silenciar' : 'Activar sonido');
  button.style.color = enabled ? 'var(--green)' : 'white';
});

renderCatalog();
setAuthMode('login');
loadAccount();
loadMovies();