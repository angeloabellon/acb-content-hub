# Importador local de manifiestos de episodios

## Flujo previsto

`Automation → exportación saneada → data/manifests → importer → adapter → Episode`

Hoy solo existe `data/manifests/demo-regular.json`, una demostración basada en el fixture de test. No es información de producción ni procede de CTC Automation.

Cuando vuelva a estar disponible el SSK, Automation deberá exportar un único JSON revisado: sin rutas locales, comprobaciones internas, configuración de OBS ni otros datos operativos. Se añadirá mediante *commit* a `data/manifests/`; la web no accede a `CTC_WORK`, al SSK ni a un disco externo.

## Contrato

`loadImportedEpisodeManifests()` lee exclusivamente los `.json` directos de `data/manifests/`, de forma no recursiva. Convierte cada archivo con `parseEpisodeManifest()` y `episodeFromManifest()` del adaptador existente; no contiene una segunda implementación del schema.

Cada archivo genera un resultado `{ episode, diagnostics, source, status }`. El estado es `imported`, `partial`, `error` o `duplicate`. Un JSON inválido, schema no soportado, archivo ilegible o campos insuficientes queda diagnosticado en su propio resultado y no impide cargar los demás.

`getImportedEpisodeById()` busca solamente resultados importados válidos por ID técnico.

## Duplicados y precedencia futura

Dos manifiestos importados con el mismo `episodio.id` no se fusionan: el primero, por orden de nombre de archivo, queda como candidato y el siguiente se marca `duplicate`.

`data/episodes.ts` sigue siendo el único origen que usa la aplicación y el piloto. `resolveEpisodesWithImportedManifests()` es un helper futuro, no conectado a las páginas. Resuelve por ID técnico sin mezclar campos: por defecto gana el manual (`manual-wins`) para conservar el comportamiento actual; un consumidor deberá seleccionar expresamente `imported-wins` tras validar un manifiesto real. En ambos casos el conflicto se devuelve de forma explícita.
