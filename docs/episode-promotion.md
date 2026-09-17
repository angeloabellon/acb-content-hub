# Promoción editorial a contenido público

## Propósito y contrato

La promoción construye un `PublicEpisodeCandidate`: una proyección revisable compatible con `Episode`, con su ID técnico, candidato, resumen de fuentes, diagnósticos, estado y versión de preview. Es una frontera editorial: no cambia `data/episodes.ts`, no publica contenido ni hace commits.

El candidato usa un episodio público actual o un episodio completo procedente del adaptador de manifest. Puede incluir opcionalmente una transcripción y capítulos. Las entradas nunca se mutan.

## Precedencia explícita

- Si existe ficha pública actual, es el candidato base (`public-data`). Un manifest concomitante se usa como evidencia, no se mezcla campo a campo.
- Los campos técnicos del manifest (`id`, tipo, temporada y número) se comparan con la ficha pública; una diferencia bloquea el candidato.
- Un `manualOverrides` es una capa editorial explícita y trazada por campo. Es la única composición de campos permitida.
- Si no hay ficha pública, un `manifestEpisode` completo puede ser el candidato base.

El `sourceSummary` registra el origen de cada campo y las fuentes conectadas sin incluir rutas locales ni secretos.

## Validación y estados

`ready` requiere ID técnico y tipo válidos, slug estable, título, descripción, fecha `YYYY-MM-DD`, miniatura pública `http(s)` y URLs públicas para las plataformas que existan. También bloquean los conflictos manifest/manual y una transcripción o capítulos incluidos que no pasen sus validadores existentes. Transcripción y capítulos siguen siendo opcionales.

Los estados son `draft`, `ready`, `blocked` y `approved`. Un candidato bloqueado no puede aprobarse. La aprobación es una transición inmutable en memoria; no es publicación.

## Flujo

`importado → candidato → diff → aprobación humana → artefacto`

El diff enumera los campos públicos como `unchanged`, `added`, `removed` o `changed`; arrays de participantes, plataformas y módulos se muestran como valores completos, por lo que no se ocultan cambios estructurales.

En `/editor/episodios/[slug]`, la sección **Promoción a público** muestra estado, bloqueos, fuentes, comparación con la ficha actual y enlaces al editor de capítulos. El botón **Aprobar candidato** solo cambia la preview actual. **Generar artefacto aprobado** exige esa aprobación de preview, reconstruye y revalida el candidato en el servidor, exige el rol editorial y crea un archivo local solo en desarrollo.

## Artefactos aprobados

Los artefactos se escriben exclusivamente bajo `data/promotions/approved/` con nombre seguro:

`<slug>--<episodeId>_v01.json`, `<slug>--<episodeId>_v02.json`, etc.

El almacenamiento exige `ENABLE_EDITOR=true` y un entorno no productivo. Usa escritura exclusiva y nunca sustituye un archivo. Cada JSON contiene `schemaVersion`, metadatos de aprobación, el `Episode` candidato, resumen de fuentes y una lista de diagnósticos vacía: los bloqueos deben estar resueltos antes de escribir.

## Límites actuales

No existe publicación automática, modificación de `data/episodes.ts`, commit automático ni despliegue. El siguiente paso será un comando `promote-to-public` que genere un patch revisable sobre esa fuente pública y requiera revisión humana antes de aplicarlo.
