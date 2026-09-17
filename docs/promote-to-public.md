# Promoción controlada a público

`data/episodes.ts` continúa siendo la fuente pública. Un JSON aprobado en `data/promotions/approved/` no se publica por sí mismo: genera un patch revisable contra esa fuente.

## Contrato

El episodio se localiza solo por `approval.episodeId`/`candidate.id`. Para una inserción se conserva ese ID; para una actualización no se reemplaza. La única whitelist promovible es: `slug`, `title`, `description`, `date`, `thumbnail`, `participants`, `platforms`, `kind`, `season` y `episodeNumber`. Cualquier campo manual restante —por ejemplo `transcript`, `subtitles`, `derivedPieces` o `relatedContent`— se conserva intacto.

## Flujo editorial

1. Genera o selecciona el artefacto aprobado versionado.
2. En el panel privado pulsa **Previsualizar promoción pública**. No escribe nada: muestra inserción o actualización y los cambios de whitelist.
3. El preview incluye un token con SHA-256 del contenido actual de `data/episodes.ts` y la versión del artefacto.
4. Revisa el patch, marca la confirmación explícita y pulsa **Aplicar promoción**.
5. Antes de escribir se recalcula el hash y se comprueba que no haya un JSON aprobado más reciente para el mismo ID. Si algo cambió, el preview queda obsoleto y hay que regenerarlo.

Solo el servidor autenticado (`requireEditor`), en desarrollo local con `ENABLE_EDITOR=true`, puede aplicar. Producción y Vercel quedan bloqueados. Las rutas son fijas: no se aceptan paths del navegador.

## Escritura, comprobación y rollback

Aplicar crea primero `data/episodes.ts.backup-<timestamp>` y después sustituye el archivo con un temporal y `rename` atómico. No hay commit, push ni deploy automático. Revisa siempre `git diff` y realiza el commit manualmente. Para volver atrás, restaura manualmente el backup correspondiente tras inspeccionarlo.

También se puede usar la CLI local:

```sh
npm run promote:preview -- <slug>--<episodeId>_vNN.json
npm run promote:apply -- <slug>--<episodeId>_vNN.json --token <token-del-preview>
npm run promote:validate
```

La CLI imprime el token y los campos modificados. El apply vuelve a validar hash y versión: no evita la revisión humana.
