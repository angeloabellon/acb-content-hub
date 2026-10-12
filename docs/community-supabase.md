# Comunidad CTC: Supabase

La Comunidad usa Supabase solo para sus datos públicos y el acceso de participantes. El acceso editorial existente sigue usando las credenciales privadas de NextAuth y no se mezcla con estas sesiones.

## Activación

1. Crear o elegir un proyecto de Supabase.
2. Ejecutar, en orden, todas las migraciones de [`supabase/migrations`](../supabase/migrations), incluida [`202610120001_flatten_community_into_permanent_topics.sql`](../supabase/migrations/202610120001_flatten_community_into_permanent_topics.sql). En un proyecto ya activo, aplicar únicamente esta última después de confirmar una copia de seguridad.
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

- `community_spaces`: categorías históricas `acb` y `bcl`, conservadas por compatibilidad de datos; ya no se muestran como nivel de navegación.
- `community_profiles`: perfil público mínimo enlazado a `auth.users`.
- `community_topics`: exactamente dos conversaciones principales: `ucam-murcia-en-acb` y `ucam-murcia-en-bcl`.
- `community_posts`: todos los mensajes de cada conversación. Las aperturas de los antiguos temas conservan el título original en `legacy_topic_title`, que se muestra destacado de forma segura antes de su texto.
- `community_topic_follows`: seguimiento privado de cada persona, incluida su última lectura.

La migración de reforma guarda las URLs anteriores en `community_topic_legacy_routes`, conserva un registro técnico en `community_topic_migrations`, unifica los seguimientos por hilo raíz y remapea los avisos relacionados con respuestas. Las menciones permanecen en el cuerpo original y se resuelven igual que antes. El estado de lectura combinado usa la fecha más antigua para no ocultar respuestas que antes estuvieran sin leer.

Las políticas RLS permiten leer únicamente contenido visible. Una persona autenticada ya no puede crear temas: solo puede responder con su propio `auth.uid()` en uno de los dos hilos principales, siempre que no esté bloqueado. Los seguimientos y sus marcas de lectura son privados: cada persona solo puede consultarlos, crearlos, actualizarlos o eliminarlos para su propio `auth.uid()`. No hay permisos de edición ni de moderación expuestos desde la interfaz todavía.

## Acceso

El acceso de Comunidad utiliza enlaces de un solo uso por correo (`signInWithOtp`), sin contraseñas. Tras abrir el primer enlace, el callback canjea el código por una sesión de Supabase que se guarda en cookies. Mientras sea válida, la persona permanece identificada y puede publicar sin recibir otro correo.

La aplicación verifica la identidad con `getClaims()` en servidor; no confía en una sesión leída directamente de cookies. El `proxy.ts` de Next 16 se limita a rutas `/comunidad` y refresca las cookies de sesión. La interfaz muestra la identidad de la sesión activa y permite cerrarla solo en el navegador actual. Una persona que ya tenga sesión y visite `/comunidad/acceso` vuelve directamente a `/comunidad`.

Sin las variables de Supabase, las pantallas siguen funcionando con conversaciones de muestra, pero la publicación permanece desactivada de forma explícita.

## Aplicación segura de la reforma en producción

1. En Supabase, crear un backup o una rama de base de datos y comprobar que existen temas de ACB y BCL y sus perfiles autores. La migración necesita al menos un perfil existente para asignar el propietario técnico de cada hilo raíz.
2. Ejecutar la migración `202610120001_flatten_community_into_permanent_topics.sql` una única vez desde el SQL Editor o mediante el flujo de migraciones habitual. Es idempotente: sus rutas y registros de migración se pueden volver a ejecutar sin duplicar aperturas, respuestas o seguimientos.
3. Verificar que `community_topics` contiene solo `ucam-murcia-en-acb` y `ucam-murcia-en-bcl`; comprobar que los contadores y `last_activity_at` coinciden con los mensajes visibles de cada hilo.
4. Abrir una URL antigua de espacio (`/comunidad/acb` o `/comunidad/bcl`) y un enlace de tema previo: ambos deben llegar al hilo raíz correcto. Confirmar que los avisos existentes navegan al mismo destino.
5. Con una cuenta de prueba, responder, mencionar a otra cuenta, seguir/dejar de seguir y abrir de nuevo ambos hilos. Confirmar que el centro de avisos y las no leídas siguen funcionando y que ya no aparece ninguna opción para crear un tema.

## Seguimiento y novedades

Al seguir una conversación principal, la Comunidad guarda la última visita y muestra el número de respuestas nuevas. Al abrirla se actualiza la marca de lectura; no se envía ningún correo ni se realiza ninguna notificación fuera de la web.
