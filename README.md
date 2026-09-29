# Novaflix

Prototipo de catálogo de streaming con cuentas locales, lista personal y reproductor HTML5 de demostración.

## Iniciar

Necesitas Node.js 18 o posterior. Desde esta carpeta ejecuta:

```sh
node server.js
```

Abre <http://localhost:8000>. Las cuentas y listas se guardan en `data/users.json`, y las películas que se añaden desde el panel de administración en `data/movies.json`; las contraseñas se almacenan cifradas con scrypt. No se necesita instalar dependencias.

Para crear o promover una cuenta administradora, detén el servidor y vuelve a iniciarlo configurando `NOVA_ADMIN_EMAIL`, `NOVA_ADMIN_PASSWORD` (mínimo 12 caracteres) y, opcionalmente, `NOVA_ADMIN_NAME`. Si el correo ya tiene cuenta, conserva su contraseña y obtiene el rol de administrador. No hay una contraseña predeterminada. Al iniciar sesión, la cuenta admin verá el botón «Gestionar películas» en su perfil y podrá añadir películas o series.

El reproductor usa un vídeo de muestra público. Para distribuir películas reales, añade archivos o URLs de contenido que tengas derecho a emitir y configura un servicio de almacenamiento/streaming adecuado. Este prototipo no es un servicio de producción: no incluye verificación de correo, recuperación de contraseña ni persistencia de sesiones tras reiniciar el servidor.

## Publicar una demo en GitHub Pages

El workflow `.github/workflows/pages.yml` publica automáticamente el catálogo estático al enviar cambios a `main`. En GitHub, abre **Settings > Pages** y selecciona **GitHub Actions** como fuente de despliegue. La URL aparecerá en esa sección cuando termine la primera publicación.

Pages no ejecuta `server.js`: registro, inicio de sesión y administración quedan desactivados allí. Para añadir títulos a la demo, edita `data/movies.json` y vuelve a subir el cambio. Ese archivo es público; no incluyas datos privados, contraseñas ni URLs de vídeo no autorizadas. Para mantener las funciones completas, despliega el servidor Node en otro servicio.