# Autenticación editorial privada

## Arquitectura

El acceso a `/editor/**` usa NextAuth (Auth.js) con el proveedor `Credentials`. Es la alternativa más simple para un único editor: no introduce una base de datos, cuenta OAuth externa ni cookies propias. NextAuth verifica la sesión JWT en el servidor y gestiona sus cookies seguras (`httpOnly`; `secure` en HTTPS/producción) y la protección CSRF de sus rutas de autenticación.

La contraseña nunca se guarda ni se compara en el cliente. `EDITOR_AUTH_PASSWORD_HASH` contiene un hash bcrypt y se verifica únicamente en `auth.ts`. Al iniciar sesión, los callbacks incorporan el rol mínimo `editor` a la sesión. `requireEditor` comprueba ese rol dentro de cada página editorial y también en la Server Action que guarda capítulos; por tanto no se depende de ocultar enlaces ni de un Proxy/middleware.

`/editor/login` permanece pública. El subárbol editorial actual tiene una comprobación en su layout, y cada página y Server Action vuelve a comprobar el rol antes de leer o modificar información. Si no hay sesión o el rol no es `editor`, se redirige al login con una ruta de retorno restringida a `/editor/`, evitando redirecciones externas. El panel muestra **Cerrar sesión**, que elimina la sesión mediante NextAuth.

## Variables de entorno

Copiar `.env.example` a `.env.local` y completar solo valores privados:

```bash
AUTH_SECRET="$(openssl rand -base64 32)"
EDITOR_AUTH_EMAIL="editor@example.com"
EDITOR_AUTH_PASSWORD_HASH="$(node -e 'const b=require("bcryptjs"); b.hash(process.argv[1], 12).then(console.log)' 'elige-una-contraseña-larga')"
```

`.env.local` está ignorado por Git mediante `.env*`. No añadir estas variables con prefijo `NEXT_PUBLIC_` y no usar una contraseña en texto plano. Si falta cualquiera de las tres variables, el login se deshabilita y las rutas editoriales redirigen de forma segura al login.

`ENABLE_EDITOR=true` ya no da acceso al panel: únicamente conserva el guardado de archivos de capítulos en desarrollo local. Vercel no debe configurarlo para habilitar escritura.

## Despliegue en Vercel

En el proyecto Vercel, añadir `AUTH_SECRET`, `EDITOR_AUTH_EMAIL` y `EDITOR_AUTH_PASSWORD_HASH` en **Settings → Environment Variables** para Production (y Preview solo si se necesita probar el acceso). Generar valores diferentes por entorno. Tras guardar, desplegar de nuevo. No hay configuración de Vercel versionada en este repositorio ni cambios en rutas públicas, sitemap o navegación.

Para rotar el acceso, generar un `AUTH_SECRET` nuevo y un nuevo hash bcrypt, actualizar ambas variables en Vercel y volver a desplegar. La rotación de `AUTH_SECRET` invalida las sesiones existentes. Para cambiar a Google, GitHub u otro proveedor en el futuro, sustituir el proveedor Credentials en `auth.ts` y conservar `requireEditor` como frontera de autorización, asignando explícitamente el rol desde un allowlist o almacenamiento de usuarios revisado.

## Límites de esta versión

Existe un solo editor configurado por variables de entorno. No hay gestión de usuarios, recuperación de contraseña, MFA, rate limiting propio, edición de metadata ni publicación automática. NextAuth aporta los controles de sesión y CSRF; se puede añadir rate limiting cuando exista infraestructura compartida adecuada.
