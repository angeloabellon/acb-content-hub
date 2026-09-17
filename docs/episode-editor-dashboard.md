# Panel editorial de episodio

La ruta privada `/editor/episodios/[slug]` concentra una lectura editorial de cada episodio sin convertirse en un CMS. Está fuera de la navegación y del sitemap. Requiere una sesión de usuario con rol `editor`; consulta `docs/editor-auth.md` para la configuración.

## Secciones

- **Resumen**: identificadores, metadatos editoriales y participantes.
- **Transcripción**: estado, segmentos, idioma, timestamps, versión, hash y diagnósticos. Los fixtures se etiquetan inequívocamente como `Demo técnica`.
- **Capítulos**: capítulos de la fuente controlada, JSON locales de `data/chapters/generated/` y acceso al editor de propuestas. Los locales se distinguen como `local/dev`.
- **Publicación**: enlaces existentes a plataformas y las plataformas que faltan; es solo lectura.
- **Promoción a público**: candidato verificable, bloqueos, diff frente a la ficha actual y generación local de un artefacto aprobado. Consulta `docs/episode-promotion.md`; no publica ni altera la fuente pública.
- **Diagnóstico**: resultados de importación de manifests/transcripciones y warnings relevantes.
- **Piezas derivadas**: placeholder estructurado para clips, shorts y derivados futuros.

## Fuentes actuales

El view model `EpisodeEditorialSummary` se construye en `lib/episode-editor.ts` a partir de los helpers de episodios, capítulos, transcripciones y los importadores ya existentes. Los JSON generados se leen únicamente desde el directorio controlado de capítulos y vuelven a validarse con `validateChapters`; no se interpreta ninguna ruta suministrada por el usuario.

## Limitaciones y evolución

El panel no edita metadata pública, no publica, no llama a APIs externas y no conecta SSK ni Automation. Los artefactos de promoción son únicamente una propuesta versionada local: una iteración posterior generará un patch revisable antes de cualquier cambio sobre metadata pública.
