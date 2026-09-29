const http = require('node:http');
const path = require('node:path');
const fs = require('node:fs/promises');
const { randomBytes, scrypt: scryptCallback, timingSafeEqual } = require('node:crypto');
const { promisify } = require('node:util');

const scrypt = promisify(scryptCallback);
const PORT = Number(process.env.PORT || 8000);
const DATA_DIR = process.env.NOVA_DATA_DIR || path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const MOVIES_FILE = path.join(DATA_DIR, 'movies.json');
const sessions = new Map();
let users = {};
let movies = [];

async function saveUsers() {
  const temporaryFile = `${USERS_FILE}.tmp`;
  await fs.writeFile(temporaryFile, JSON.stringify(users, null, 2), { mode: 0o600 });
  await fs.rename(temporaryFile, USERS_FILE);
}

async function saveMovies() {
  const temporaryFile = `${MOVIES_FILE}.tmp`;
  await fs.writeFile(temporaryFile, JSON.stringify(movies, null, 2), { mode: 0o600 });
  await fs.rename(temporaryFile, MOVIES_FILE);
}

async function readBody(request) {
  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 16_384) throw Object.assign(new Error('La solicitud es demasiado grande.'), { status: 413 });
  }
  try {
    return JSON.parse(body || '{}');
  } catch {
    throw Object.assign(new Error('La solicitud no tiene un formato válido.'), { status: 400 });
  }
}

function sendJson(response, status, value, headers = {}) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers });
  response.end(JSON.stringify(value));
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role || 'user' };
}

function sessionUser(request) {
  const cookie = request.headers.cookie || '';
  const token = cookie.split(';').map((part) => part.trim()).find((part) => part.startsWith('novaflix_session='))?.split('=')[1];
  const email = token && sessions.get(token);
  return email ? users[email] : null;
}

function setSessionCookie(request, response, token, maxAge) {
  const secure = request.socket.encrypted || request.headers['x-forwarded-proto'] === 'https' ? '; Secure' : '';
  response.setHeader('Set-Cookie', `novaflix_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${secure}`);
}

async function handleApi(request, response, pathname) {
  if (request.method === 'GET' && pathname === '/api/movies') {
    return sendJson(response, 200, { movies });
  }

  if (request.method === 'POST' && pathname === '/api/movies') {
    const user = sessionUser(request);
    if (!user || user.role !== 'admin') return sendJson(response, 403, { error: 'Solo un administrador puede añadir películas.' });
    const body = await readBody(request);
    if (!body || typeof body !== 'object' || Array.isArray(body)) return sendJson(response, 400, { error: 'Los datos de la película no son válidos.' });

    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const genre = typeof body.genre === 'string' ? body.genre.trim() : '';
    const description = typeof body.description === 'string' ? body.description.trim() : '';
    const length = typeof body.length === 'string' ? body.length.trim() : '';
    const imageUrl = typeof body.imageUrl === 'string' ? body.imageUrl.trim() : '';
    const videoUrl = typeof body.videoUrl === 'string' ? body.videoUrl.trim() : '';
    const kind = body.kind;
    const year = Number(body.year);
    const score = Number(body.score);
    const age = body.age;
    const isSecureUrl = (value) => {
      try { return new URL(value).protocol === 'https:'; } catch { return false; }
    };

    if (name.length < 2 || name.length > 100) return sendJson(response, 400, { error: 'El título debe tener entre 2 y 100 caracteres.' });
    if (!genre || genre.length > 80) return sendJson(response, 400, { error: 'Añade un género de hasta 80 caracteres.' });
    if (!['Películas', 'Series'].includes(kind)) return sendJson(response, 400, { error: 'Selecciona película o serie.' });
    if (!description || description.length > 1000) return sendJson(response, 400, { error: 'La sinopsis debe tener hasta 1000 caracteres.' });
    if (!Number.isInteger(year) || year < 1888 || year > new Date().getFullYear() + 5) return sendJson(response, 400, { error: 'El año no es válido.' });
    if (!Number.isInteger(score) || score < 0 || score > 100) return sendJson(response, 400, { error: 'La valoración debe estar entre 0 y 100.' });
    if (!['7+', '13+', '16+', '18+'].includes(age)) return sendJson(response, 400, { error: 'Selecciona una clasificación válida.' });
    if (!length || length.length > 50) return sendJson(response, 400, { error: 'Añade una duración de hasta 50 caracteres.' });
    if (!isSecureUrl(imageUrl) || imageUrl.length > 2048) return sendJson(response, 400, { error: 'El cartel debe tener una URL HTTPS válida.' });
    if (videoUrl && (!isSecureUrl(videoUrl) || videoUrl.length > 2048)) return sendJson(response, 400, { error: 'El vídeo debe tener una URL HTTPS válida.' });

    const movie = {
      id: `film-${randomBytes(8).toString('hex')}`,
      name,
      genre,
      kind,
      year: String(year),
      score: `${score}%`,
      age,
      length,
      label: 'NUEVA',
      image: imageUrl,
      videoUrl,
      description,
    };
    movies.unshift(movie);
    await saveMovies();
    return sendJson(response, 201, { movie });
  }

  if (request.method === 'POST' && (pathname === '/api/register' || pathname === '/api/login')) {
    const body = await readBody(request);
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return sendJson(response, 400, { error: 'Introduce un correo electrónico válido.' });
    if (password.length < 8 || password.length > 128) return sendJson(response, 400, { error: 'La contraseña debe tener entre 8 y 128 caracteres.' });

    let user = users[email];
    if (pathname === '/api/register') {
      const name = typeof body.name === 'string' ? body.name.trim() : '';
      if (name.length < 2 || name.length > 40) return sendJson(response, 400, { error: 'El nombre debe tener entre 2 y 40 caracteres.' });
      if (user) return sendJson(response, 409, { error: 'Ya existe una cuenta con ese correo.' });
      const salt = randomBytes(16).toString('hex');
      const passwordHash = (await scrypt(password, salt, 64)).toString('hex');
      user = { id: randomBytes(12).toString('hex'), name, email, salt, passwordHash, role: 'user', watchlist: [] };
      users[email] = user;
      await saveUsers();
    } else {
      if (!user) return sendJson(response, 401, { error: 'Correo o contraseña incorrectos.' });
      const candidate = await scrypt(password, user.salt, 64);
      if (!timingSafeEqual(candidate, Buffer.from(user.passwordHash, 'hex'))) return sendJson(response, 401, { error: 'Correo o contraseña incorrectos.' });
    }

    const token = randomBytes(32).toString('hex');
    sessions.set(token, email);
    setSessionCookie(request, response, token, 60 * 60 * 24 * 7);
    return sendJson(response, 200, { user: publicUser(user), watchlist: user.watchlist });
  }

  if (request.method === 'GET' && pathname === '/api/me') {
    const user = sessionUser(request);
    return sendJson(response, 200, { user: user ? publicUser(user) : null, watchlist: user?.watchlist || [] });
  }

  if (request.method === 'POST' && pathname === '/api/logout') {
    const cookie = request.headers.cookie || '';
    const token = cookie.split(';').map((part) => part.trim()).find((part) => part.startsWith('novaflix_session='))?.split('=')[1];
    if (token) sessions.delete(token);
    setSessionCookie(request, response, '', 0);
    return sendJson(response, 200, { ok: true });
  }

  if (request.method === 'POST' && pathname === '/api/watchlist') {
    const user = sessionUser(request);
    if (!user) return sendJson(response, 401, { error: 'Inicia sesión para guardar tu lista en la cuenta.' });
    const body = await readBody(request);
    if (typeof body.titleId !== 'string' || !/^[a-z0-9-]{1,80}$/.test(body.titleId)) return sendJson(response, 400, { error: 'Título no válido.' });
    user.watchlist = user.watchlist.includes(body.titleId) ? user.watchlist.filter((id) => id !== body.titleId) : [...user.watchlist, body.titleId];
    await saveUsers();
    return sendJson(response, 200, { watchlist: user.watchlist });
  }

  return sendJson(response, 404, { error: 'Ruta no encontrada.' });
}

const publicFiles = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ['/styles.css', ['styles.css', 'text/css; charset=utf-8']],
  ['/deployment-config.js', ['deployment-config.js', 'text/javascript; charset=utf-8']],
  ['/app.js', ['app.js', 'text/javascript; charset=utf-8']],
]);

async function handleRequest(request, response) {
  const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
  if (url.pathname.startsWith('/api/')) return handleApi(request, response, url.pathname);
  const file = publicFiles.get(url.pathname);
  if (request.method !== 'GET' || !file) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return response.end('No encontrado');
  }
  const content = await fs.readFile(path.join(__dirname, file[0]));
  response.writeHead(200, { 'Content-Type': file[1], 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
  response.end(content);
}

async function start() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    users = JSON.parse(await fs.readFile(USERS_FILE, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    await saveUsers();
  }

  try {
    movies = JSON.parse(await fs.readFile(MOVIES_FILE, 'utf8'));
    if (!Array.isArray(movies)) throw new Error('El catálogo guardado no tiene un formato válido.');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    await saveMovies();
  }

  const adminEmail = (process.env.NOVA_ADMIN_EMAIL || '').trim().toLowerCase();
  const adminPassword = process.env.NOVA_ADMIN_PASSWORD || '';
  if (adminEmail || adminPassword) {
    const adminName = (process.env.NOVA_ADMIN_NAME || 'Administración').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail) || adminEmail.length > 254) throw new Error('NOVA_ADMIN_EMAIL debe ser un correo válido.');
    if (adminPassword.length < 12 || adminPassword.length > 128) throw new Error('NOVA_ADMIN_PASSWORD debe tener entre 12 y 128 caracteres.');
    let admin = users[adminEmail];
    if (!admin) {
      const salt = randomBytes(16).toString('hex');
      const passwordHash = (await scrypt(adminPassword, salt, 64)).toString('hex');
      admin = { id: randomBytes(12).toString('hex'), name: adminName, email: adminEmail, salt, passwordHash, role: 'admin', watchlist: [] };
      users[adminEmail] = admin;
    } else {
      admin.role = 'admin';
    }
    await saveUsers();
    console.log(`Cuenta administradora habilitada para ${adminEmail}`);
  }

  const server = http.createServer((request, response) => {
    handleRequest(request, response).catch((error) => {
      if (!response.headersSent) sendJson(response, error.status || 500, { error: error.status ? error.message : 'Error interno del servidor.' });
      else response.destroy();
      if (!error.status) console.error(error);
    });
  });
  server.listen(PORT, '0.0.0.0', () => console.log(`Novaflix disponible en http://localhost:${PORT}`));
}

start().catch((error) => {
  console.error('No se pudo iniciar Novaflix:', error);
  process.exitCode = 1;
});