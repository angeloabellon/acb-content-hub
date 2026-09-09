# Transcripciones de episodios

## Estado actual

La aplicación admite transcripciones locales separadas de la entidad `Episode`.
`data/episodes.ts` solo conserva una referencia mínima (idioma, origen y
visibilidad); el texto completo está en `data/transcripts/`. Así los listados,
el sitemap y las importaciones de manifiestos no cargan accidentalmente una
transcripción completa.

El único archivo disponible hoy es
`data/transcripts/demo-especial-copa-del-96.ts`. Es un fixture técnico, no una
transcripción del especial de la Copa del 96. Su publicación está bloqueada por
defecto: solo se renderiza con `NEXT_PUBLIC_ENABLE_DEMO_TRANSCRIPTS=true`.
No se debe activar en producción. Esta decisión permite verificar la UI sin
atribuir texto ficticio a personas reales.

## Modelo

`Transcript` identifica el episodio técnico mediante `episodeId`, define
`language`, `source`, `version`, `visibility` y una colección de segmentos.
Cada `TranscriptSegment` tiene `id` y `text`, más `startSeconds`, `endSeconds`
y `speaker` opcionales. Por ello admite tanto fuentes SRT temporizadas como
transcripciones de texto todavía sin marcas de tiempo.

`lib/transcripts.ts` es la única capa de lectura local: `getTranscriptByEpisodeId`,
`getTranscriptSegments` y `getRenderableTranscriptByEpisodeId`. No consulta el
SSK, Automation, rutas externas ni APIs.

## Ficha y enlaces

La ficha de episodio renderiza el módulo server-side mediante `<details>`, con
el contenido presente en el HTML e indexable cuando es público. Cada segmento
recibe un ancla estable `#transcript-<id>`. Los timestamps, cuando existen, se
muestran como una etiqueta: todavía no se convierten en enlaces porque el
reproductor de YouTube no tiene seek integrado.

No se ha añadido búsqueda local en esta fase para mantener el módulo como
Server Component y no enviar el texto de forma duplicada a un componente
cliente. La búsqueda por episodio puede añadirse después como una isla cliente
con resaltado accesible, si el tamaño de las transcripciones lo justifica.

## Flujo futuro

Cuando exista una exportación real y revisada, el flujo será:

`Automation → exportación TXT/SRT saneada → importador validado → data/transcripts → Transcript → ficha`

Primero debe importarse y revisarse una transcripción real de un único episodio.
Después se podrá mapear timestamps a capítulos y, solo con un destino de
reproducción fiable, habilitar seek desde las marcas de tiempo.
