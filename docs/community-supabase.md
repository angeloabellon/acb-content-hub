# Comunidad CTC: Supabase

La Comunidad usa Supabase solo para sus datos públicos y el acceso de participantes. El acceso editorial existente sigue usando las credenciales privadas de NextAuth y no se mezcla con estas sesiones.

## Activación

1. Crear o elegir un proyecto de Supabase.
2. Ejecutar, en orden, las migraciones [`supabase/migrations/202610090001_create_community.sql`](../supabase/migrations/202610090001_create_community.sql) y [`supabase/migrations/202610100001_add_community_topic_follows.sql`](../supabase/migrations/202610100001_add_community_topic_follows.sql) en el SQL Editor del proyecto.
3. Añadir estas variables en local y en el entorno de despliegue:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://tu-proyecto.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="tu-publishable-key"
```

4. En **Authentication → URL Configuration**, configurar la URL pública de la web como Site URL y añadir esta Redirect URL:

```text
https://casttocast.es/comunidad/auth/callback
```

Para desarrollo local se puede añadir también `http://localhost:3000/comunidad/auth/callback` (o el puerto que se esté usando).

## Modelo y permisos

- `community_spaces`: los dos espacios fijos, `acb` y `bcl`.
- `community_profiles`: perfil público mínimo enlazado a `auth.users`.
- `community_topics`: temas de conversación.
- `community_posts`: respuestas a temas.
- `community_topic_follows`: seguimiento privado de cada persona, incluida su última lectura. El autor sigue automáticamente el tema que crea.

Las políticas RLS permiten leer únicamente contenido visible. Una persona autenticada solo puede insertar temas y respuestas con su propio `auth.uid()`; las respuestas también respetan el bloqueo de un tema. Los seguimientos y sus marcas de lectura son privados: cada persona solo puede consultarlos, crearlos, actualizarlos o eliminarlos para su propio `auth.uid()`. No hay permisos de edición ni de moderación expuestos desde la interfaz todavía.

## Acceso

El acceso de Comunidad utiliza enlaces de un solo uso por correo (`signInWithOtp`), sin contraseñas. Tras abrir el primer enlace, el callback canjea el código por una sesión de Supabase que se guarda en cookies. Mientras sea válida, la persona permanece identificada y puede publicar sin recibir otro correo.

La aplicación verifica la identidad con `getClaims()` en servidor; no confía en una sesión leída directamente de cookies. El `proxy.ts` de Next 16 se limita a rutas `/comunidad` y refresca las cookies de sesión. La interfaz muestra la identidad de la sesión activa y permite cerrarla solo en el navegador actual. Una persona que ya tenga sesión y visite `/comunidad/acceso` vuelve directamente a `/comunidad`.

Sin las variables de Supabase, las pantallas siguen funcionando con conversaciones de muestra, pero la publicación permanece desactivada de forma explícita.

## Seguimiento y novedades

Al seguir un tema, la Comunidad guarda la última visita y muestra el número de respuestas nuevas en los listados. Al abrir un tema seguido se actualiza la marca de lectura; no se envía ningún correo ni se realiza ninguna notificación fuera de la web.
