# Capítulos de episodio

## Contrato

`Chapter` vive en `types/chapter.ts`, separado deliberadamente de `Episode` y de
la transcripción. Cada capítulo tiene un `id` estable, `episodeId`, `title` y
`startSeconds`. Puede añadir `endSeconds`, descripción, referencias opcionales a
`transcriptSegmentIds` y metadatos editoriales (`source`, `version`, `reviewed`).

Las fuentes locales se registran bajo `data/chapters/`; no se incorporan a
`data/episodes.ts`. Los fixtures con `visibility: "development-only"` solo se
renderizan al activar `NEXT_PUBLIC_ENABLE_DEMO_TRANSCRIPTS=true`.

## Validación y transcripción

`validateChapters` exige inicios finitos no negativos, títulos no vacíos, IDs
únicos por colección de episodio y orden estrictamente creciente. Si hay final,
debe ser posterior al inicio; el final de un capítulo no puede invadir el inicio
del siguiente. Al proporcionar `episodeId`, todos los capítulos deben pertenecer
a él.

Un transcript no es obligatorio. Sin embargo, un capítulo que use
`transcriptSegmentIds` necesita un `Transcript` del mismo episodio y cada ID debe
existir en él. `getTranscriptSegmentsForChapter` resuelve esas referencias en el
orden editorial declarado, sin crear enlaces ni mezclar episodios.

## Enlaces

Cada capítulo tiene el fragmento estable `#chapter-<id>`. La interfaz muestra el
timestamp siempre. Solo es un enlace externo cuando la URL del episodio es un
`youtube.com/watch?v=...` o `youtu.be/...` válido: `getYouTubeTimestampUrl`
preserva los parámetros existentes y añade o reemplaza `t=<segundos>s`. Otros
dominios no reciben enlace temporizado.

## Siguiente evolución

Las propuestas automáticas ya viven como borradores separados en
`types/chapter-proposal.ts`; véase `chapter-proposals.md`. Solo las propuestas
aceptadas pueden convertirse en `Chapter`, pasan esta misma validación y no se
publican automáticamente. Esta capa no incluye IA remota, API routes,
Automation ni SSK.
