const image = (id, width = 720) => id.startsWith('https://') ? id : `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=82`;
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const isGitHubPages = window.NOVAFLIX_STATIC_MODE === true;
const titles = [];

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
  emptyState.textContent = titles.length ? 'No encontramos historias con esos filtros. Prueba otra búsqueda.' : 'Todavía no hay títulos en el catálogo.';
  grid.hidden = filtered.length === 0;
  document.querySelector('#result-count').textContent = `${filtered.length} títulos`;
  document.querySelectorAll('.list-count').forEach((count) => { count.textContent = saved.size; });
  renderFeaturedTitle();
}

function renderFeaturedTitle() {
  const title = titles[0];
  const hero = document.querySelector('.hero');
  hero.hidden = !title;
  if (!title) return;
  document.querySelector('#hero-title').textContent = title.name;
  document.querySelector('#hero-score').textContent = `${title.score} para ti`;
  document.querySelector('#hero-year').textContent = title.year;
  document.querySelector('#hero-rating').textContent = title.age;
  document.querySelector('#hero-length').textContent = title.length;
  document.querySelector('#hero-copy').textContent = title.description;
  document.querySelector('#hero-art').style.backgroundImage = `url('${image(title.image, 1800)}')`;
  document.querySelector('#hero-play').dataset.title = title.id;
  document.querySelector('#hero-details').dataset.title = title.id;
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
  const placeholder = document.querySelector('#player-placeholder');
  videoPlayer.pause();
  if (title.videoUrl) {
    videoPlayer.src = title.videoUrl;
    videoPlayer.poster = image(title.image, 1200);
    videoPlayer.hidden = false;
    placeholder.hidden = true;
    videoPlayer.load();
    videoPlayer.currentTime = 0;
  } else {
    videoPlayer.removeAttribute('src');
    videoPlayer.removeAttribute('poster');
    videoPlayer.hidden = true;
    placeholder.hidden = false;
    videoPlayer.load();
    placeholder.querySelector('p').textContent = 'Este título todavía no tiene un vídeo disponible.';
  }
  playerDialog.showModal();
  if (title.videoUrl) videoPlayer.play().catch(() => {});
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

document.querySelector('#hero-details').addEventListener('click', (event) => openDetails(event.currentTarget.dataset.title));
document.querySelector('#hero-play').addEventListener('click', (event) => playTitle(event.currentTarget.dataset.title));
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