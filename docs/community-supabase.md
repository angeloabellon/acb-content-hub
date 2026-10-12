# Comunidad CTC: Supabase

La Comunidad usa Supabase solo para sus datos públicos y el acceso de participantes. El acceso editorial existente sigue usando las credenciales privadas de NextAuth y no se mezcla con estas sesiones.

## Activación

1. Crear o elegir un proyecto de Supabase.
2. Ejecutar, en orden, todas las migraciones de [`supabase/migrations`](../supabase/migrations), incluida [`202610120002_community_password_auth.sql`](../supabase/migrations/202610120002_community_password_auth.sql). En un proyecto ya activo, hacer una copia de seguridad y aplicar las migraciones que todavía no figuren en su historial.
3. Añadir estas variables en local y en el entorno de despliegue:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://tu-proyecto.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="tu-publishable-key"
# Solo en el servidor: permite resolver usuario → correo dentro de una RPC
# privada antes de llamar a signInWithPassword. Nunca se expone al navegador.
SUPABASE_SERVICE_ROLE_KEY="tu-service-role-key"
```

4. En **Authentication → URL Configuration**, configurar `https://casttocast.es` como **Site URL** y añadir esta Redirect URL:

```text
https://casttocast.es/comunidad/auth/callback
```

Para desarrollo local se puede añadir también `http://localhost:3000/comunidad/auth/callback` (o el puerto que se esté usando).

5. En **Authentication → Providers → Email**, activar **Confirm email** y dejar habilitado el acceso por email y contraseña. La confirmación se utiliza solo después del alta; el acceso cotidiano de la web se hace con usuario y contraseña.

6. En **Authentication → Email Templates**, personalizar al menos estas plantillas. Mantener `{{ .ConfirmationURL }}` sin modificar para que Supabase genere el enlace seguro.

   **Confirm signup**

   - Subject: `Confirma tu cuenta de Comunidad CTC`
   - HTML:

   ```html
   <h2>Bienvenido/a a Comunidad CTC</h2>
   <p>Confirma tu correo para activar tu cuenta. Después podrás acceder con tu nombre de usuario y contraseña.</p>
   <p><a href="{{ .ConfirmationURL }}">Confirmar mi cuenta</a></p>
   <p>Si no has creado esta cuenta, puedes ignorar este correo.</p>
   ```

   **Reset Password**

   - Subject: `Restablece tu contraseña de Comunidad Cast To Cast`
   - HTML:

   ```html
   <!doctype html>
   <html lang="es">
     <head>
       <meta charset="utf-8">
       <meta name="viewport" content="width=device-width, initial-scale=1">
       <title>Restablece tu contraseña | Comunidad Cast To Cast</title>
     </head>
     <body style="margin:0;padding:0;background-color:#090909;color:#ffffff;font-family:Arial,Helvetica,sans-serif;">
       <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;margin:0;padding:0;background-color:#090909;">
         <tr>
           <td align="center" style="padding:32px 16px;">
             <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background:linear-gradient(135deg,#140303 0%,#080808 52%,#220505 100%);border:1px solid #4a1111;border-radius:24px;overflow:hidden;">
               <tr>
                 <td style="height:5px;background:linear-gradient(90deg,#7a0c0c 0%,#e01310 100%);font-size:0;line-height:0;">&nbsp;</td>
               </tr>
               <tr>
                 <td style="padding:40px 32px 32px;">
                   <p style="margin:0 0 20px;color:#fca5a5;font-size:12px;font-weight:700;letter-spacing:2px;line-height:18px;text-transform:uppercase;">Comunidad Cast To Cast</p>
                   <h1 style="margin:0;color:#ffffff;font-size:30px;line-height:38px;font-weight:800;">Restablece tu contraseña</h1>
                   <p style="margin:24px 0 0;color:#d1d5db;font-size:16px;line-height:25px;">Hemos recibido una solicitud para cambiar la contraseña de tu cuenta. Usa el siguiente enlace para crear una nueva contraseña segura.</p>
                   <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:30px 0;">
                     <tr>
                       <td align="center" bgcolor="#e01310" style="border-radius:12px;">
                         <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:14px 22px;border:1px solid #e01310;border-radius:12px;background-color:#e01310;color:#ffffff;font-size:16px;font-weight:700;line-height:20px;text-decoration:none;">Crear una nueva contraseña</a>
                       </td>
                     </tr>
                   </table>
                   <p style="margin:0;padding-top:22px;border-top:1px solid #3a1616;color:#fbbf24;font-size:14px;line-height:22px;">Si no solicitaste este cambio, ignora este correo. Tu contraseña actual seguirá siendo válida.</p>
                 </td>
               </tr>
             </table>
             <p style="margin:18px 0 0;color:#8b8b8b;font-size:12px;line-height:18px;">Cast To Cast · Baloncesto, conversación y comunidad</p>
           </td>
         </tr>
       </table>
     </body>
   </html>
   ```

## Modelo y permisos

- `community_spaces`: categorías históricas `acb` y `bcl`, conservadas por compatibilidad de datos; ya no se muestran como nivel de navegación.
- `community_profiles`: perfil público mínimo enlazado a `auth.users`. `username` es el identificador público real, normalizado en minúsculas, único y usado por las menciones.
- `community_username_aliases`: conserva handles técnicos anteriores para que menciones históricas y sus avisos continúen resolviendo al mismo perfil. No se ofrecen como sugerencias nuevas.
- `community_topics`: exactamente dos conversaciones principales: `ucam-murcia-en-acb` y `ucam-murcia-en-bcl`.
- `community_posts`: todos los mensajes de cada conversación. Las aperturas de los antiguos temas conservan el título original en `legacy_topic_title`, que se muestra destacado de forma segura antes de su texto.
- `community_topic_follows`: seguimiento privado de cada persona, incluida su última lectura.

La migración de reforma guarda las URLs anteriores en `community_topic_legacy_routes`, conserva un registro técnico en `community_topic_migrations`, unifica los seguimientos por hilo raíz y remapea los avisos relacionados con respuestas. Las menciones permanecen en el cuerpo original y se resuelven igual que antes. El estado de lectura combinado usa la fecha más antigua para no ocultar respuestas que antes estuvieran sin leer.

Las políticas RLS permiten leer únicamente contenido visible. Una persona autenticada ya no puede crear temas: solo puede responder con su propio `auth.uid()` en uno de los dos hilos principales, siempre que no esté bloqueado. Los seguimientos y sus marcas de lectura son privados: cada persona solo puede consultarlos, crearlos, actualizarlos o eliminarlos para su propio `auth.uid()`. No hay permisos de edición ni de moderación expuestos desde la interfaz todavía.

## Acceso

El registro solicita nombre de usuario, correo y contraseña. `signUp` guarda el username normalizado en `raw_user_meta_data`, y el trigger `create_community_profile()` crea el perfil con ese valor; los nuevos registros no reciben handles automáticos tipo `aficionado-xxxx`.

Supabase confirma el correo únicamente al crear la cuenta. Después, la pantalla de acceso usa usuario y contraseña. Como GoTrue autentica con email, la Server Action resuelve el username mediante `resolve_community_login_email()` con una clave de servicio que existe solo en el servidor. La RPC no se concede a `anon` ni a `authenticated`, el correo no entra en ningún estado de la interfaz y un usuario inexistente recibe el mismo mensaje que una contraseña incorrecta: `Usuario o contraseña incorrectos.`

La recuperación usa `resetPasswordForEmail`; el callback canjea su código, guarda la sesión de recuperación en cookies y redirige a `/comunidad/nueva-contrasena`. El parámetro `next` se limita siempre a rutas internas `/comunidad`.

La aplicación verifica la identidad con `getClaims()` en servidor; no confía en una sesión leída directamente de cookies. El `proxy.ts` de Next 16 se limita a rutas `/comunidad` y refresca las cookies de sesión. La interfaz muestra la identidad de la sesión activa y permite cerrarla solo en el navegador actual. Una persona que ya tenga sesión y visite `/comunidad/acceso` vuelve directamente a `/comunidad`.

Sin las variables de Supabase, las pantallas siguen funcionando con conversaciones de muestra, pero la publicación permanece desactivada de forma explícita.

## Aplicación segura de la reforma en producción

1. En Supabase, crear un backup o una rama de base de datos y comprobar que existen temas de ACB y BCL y sus perfiles autores.
2. Aplicar `202610120002_community_password_auth.sql` desde el flujo de migraciones o el SQL Editor. Es idempotente: puede volver a ejecutarse sin duplicar alias ni modificar otro perfil.
3. Comprueba `angel.otalora` y `cast2cast.sports`. La migración los asigna si el identificador anterior es técnico y el correo o metadata tiene ese mismo local-part/username. Si la instalación usa correos distintos, ejecuta esto una vez por cuenta tras identificar su `id`; el primer `insert` preserva las menciones antiguas:

   ```sql
   insert into public.community_username_aliases (username, profile_id)
   select username, id from public.community_profiles
   where id = 'UUID_DE_LA_CUENTA' and username is not null
   on conflict (username) do nothing;

   update public.community_profiles
   set username = 'angel.otalora', updated_at = now()
   where id = 'UUID_DE_LA_CUENTA'
     and not exists (
       select 1 from public.community_profiles where username = 'angel.otalora' and id <> 'UUID_DE_LA_CUENTA'
     );
   ```

   Para `cast2cast.sports`, sustituye el username en la segunda consulta. Si el nombre ya está ocupado, no reasignarlo sin decidir primero quién debe conservarlo.
4. Configura la URL, **Confirm email** y las dos plantillas indicadas arriba; añade `SUPABASE_SERVICE_ROLE_KEY` solamente a los secretos del servidor/despliegue, nunca a una variable `NEXT_PUBLIC_*`.
5. Crea una cuenta nueva: elige `prueba.ctc`, confirma el correo, entra con `prueba.ctc` y su contraseña, recarga la página y confirma que la sesión persiste. Prueba `¿Has olvidado tu contraseña?` y verifica que el enlace lleva a la pantalla de contraseña nueva.
6. Con `angel.otalora` y `cast2cast.sports`, entra usando su username y contraseña existentes. Abre una conversación que contenga una mención técnica previa, comprueba que sigue mostrando el nombre público y publica una mención nueva mediante el autocompletado. Por último, sigue/deja de seguir un tema y revisa los avisos no leídos.

## Seguimiento y novedades

Al seguir una conversación principal, la Comunidad guarda la última visita y muestra el número de respuestas nuevas. Al abrirla se actualiza la marca de lectura; no se envía ningún correo ni se realiza ninguna notificación fuera de la web.
