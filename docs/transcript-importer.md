# Importador local de transcripciones

## Flujo previsto

`Automation/Gemini → TXT/SRT exportado → data/transcripts/source → importer → Transcript → Episode page`

La carpeta es una zona de entrada controlada por *commit*. La aplicación no lee `CTC_WORK`, SSK, discos externos ni rutas proporcionadas por un usuario. `loadImportedTranscripts()` solo consulta los archivos `.txt` y `.srt` directos de `data/transcripts/source/`, sin recorrer subdirectorios.

Los archivos de ejemplo empiezan por `DEMO_`, están saneados y no se registran en `data/transcripts/index.ts`; por tanto no llegan a la ficha del episodio. El único registro que la página puede resolver sigue siendo el fixture de la Fase 17 y conserva su flag de desarrollo.

## Convención y contrato

Un archivo debe llamarse exactamente `DEMO_CTC_T5E01_TRANSCRIPCION.txt` o `DEMO_CTC_T5E01_SUBTITULOS.srt` (el prefijo `DEMO_` es opcional). El identificador `CTC_T#E#` se deriva únicamente de ese nombre. `importTranscriptFile()` rechaza nombres con rutas, formatos no permitidos y cualquier `metadata.episodeId` que no coincida con el identificador del nombre.

`parseTranscriptTxt(input, metadata)` y `parseTranscriptSrt(input, metadata)` transforman contenido que ya está en memoria. `importTranscriptFile({ filename, contents, metadata })` añade el control de nombre, asociación de episodio, tipo y SHA-256 bruto. Todos devuelven o integran diagnósticos; `validateTranscript()` valida el modelo transformado. El resultado de importación es `{ transcript?, diagnostics, source, status }`, donde `status` es `valid` o `invalid` (la reserva `partial` queda disponible para futuras recuperaciones editoriales explícitas).

`source` conserva nombre, formato, versión opcional y el hash SHA-256 del contenido original. El hash permite detectar cambios o caducidad en una fase posterior; no hay todavía watcher, sincronización ni publicación automática. `getImportedTranscriptByEpisodeId()` es un helper futuro que solo considera resultados válidos y tampoco está conectado a la página.

## Reglas de contenido

TXT se divide por párrafos no vacíos. Se normaliza el espacio de cada párrafo y se generan IDs deterministas a partir de orden y contenido; nunca se inventan timestamps.

SRT exige índices correlativos desde `1`, una línea exacta `HH:MM:SS,mmm --> HH:MM:SS,mmm`, minutos/segundos válidos, inicio menor que fin, inicios no regresivos y texto no vacío. Los saltos de línea dentro de un cue se preservan. Ante un SRT inválido no se devuelve ningún `Transcript` publicable: los diagnósticos incluyen cue y línea cuando procede.

## Próximo paso

Tras revisar e integrar editorialmente una primera transcripción real, la siguiente iteración será Fase 18: capítulos y timestamps sobre el `Transcript` importado. Todavía no incluye seek de YouTube, búsqueda global, rutas API, GitHub Actions ni SSK.
