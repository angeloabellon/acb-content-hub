# Comunidad CTC: Supabase

La Comunidad usa Supabase solo para sus datos públicos y el acceso de participantes. El acceso editorial existente sigue usando las credenciales privadas de NextAuth y no se mezcla con estas sesiones.

## Activación

1. Crear o elegir un proyecto de Supabase.
2. Ejecutar la migración [`supabase/migrations/202610090001_create_community.sql`](../supabase/migrations/202610090001_create_community.sql) en el SQL Editor del proyecto.
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

Las políticas RLS permiten leer únicamente contenido visible. Una persona autenticada solo puede insertar temas y respuestas con su propio `auth.uid()`; las respuestas también respetan el bloqueo de un tema. No hay permisos de edición ni de moderación expuestos desde la interfaz todavía.

## Acceso

El acceso de Comunidad utiliza enlaces de un solo uso por correo (`signInWithOtp`). La aplicación verifica la identidad con `getClaims()` en servidor; no confía en una sesión leída directamente de cookies. El `proxy.ts` de Next 16 se limita a rutas `/comunidad` y refresca las cookies de sesión.

Sin las variables de Supabase, las pantallas siguen funcionando con conversaciones de muestra, pero la publicación permanece desactivada de forma explícita.
