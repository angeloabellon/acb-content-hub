# Editor privado de capítulos

La ruta de desarrollo es `/editor/episodios/[slug]/capitulos`. No se enlaza desde la navegación, el sitemap ni la ficha pública.

## Activación y alcance

Se activa únicamente en el servidor con `ENABLE_EDITOR=true` (por ejemplo, `ENABLE_EDITOR=true npm run dev`). Sin ese valor la ruta devuelve 404. Este gate es una medida de desarrollo, no autenticación ni autorización apta para producción.

La página resuelve el episodio y su transcripción local, genera borradores con el proveedor determinista, enseña evidencia y un extracto corto, y permite editar, aceptar o rechazar. La vista previa solo usa propuestas aceptadas y vuelve a usar la validación canónica de `Chapter` antes de ser válida.

Un transcript ausente o sin timestamps completos muestra un diagnóstico y no ofrece edición de capítulos inexistentes.

## Guardado local

El botón **Guardar capítulos aprobados** solo funciona cuando `ENABLE_EDITOR=true` y `NODE_ENV` no es `production`. Es una limitación deliberada: los sistemas serverless como Vercel no ofrecen escritura persistente fiable. No hay base de datos ni publicación automática.

El resultado se crea bajo `data/chapters/generated/<slug>--<episodeId>.json`. El nombre acepta solo identificadores seguros; no procede del cliente como una ruta. Se escribe con creación exclusiva, por lo que un archivo existente devuelve conflicto y nunca se sobrescribe silenciosamente. La UI pide confirmación antes de crear `-v2`, `-v3` y así sucesivamente.

El JSON contiene metadata mínima (`episodeId`, `generatedAt`, `source`, `reviewed`, `version`) y un array canónico `chapters: Chapter[]`. No incorpora borradores rechazados. Estos archivos son artefactos versionables de revisión local; incorporarlos a una fuente editorial o hacerlos públicos sigue siendo una decisión explícita posterior.
