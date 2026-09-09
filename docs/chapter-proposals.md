# Propuestas de capítulos

## Contrato editorial

`ChapterProposal` (`types/chapter-proposal.ts`) es un borrador separado de
`Chapter`. Conserva el episodio, tiempos, IDs de segmentos que sirven de
evidencia, estado, fuente y el motivo técnico de cada corte. Nunca se registra
en `data/chapters/`, no se muestra en la ficha pública y no se publica por el
mero hecho de generarse.

Los estados son `proposed`, `accepted`, `rejected` y `edited`. Editar vuelve a
dejar el borrador pendiente de aceptación; solo `accepted` puede convertirse en
un `Chapter`. La conversión es en memoria, queda como `development-only` y usa
`validateChapters` con el transcript original antes de devolver resultado.

## Heurística local actual

`generateChapterProposals` es una demostración técnica determinista, no un
criterio editorial definitivo. Requiere timestamps válidos en todos los
segmentos; si faltan devuelve `unsupported/no_timestamps` y no fabrica tiempos.
Los títulos son deliberadamente neutros (`Bloque 1`, `Bloque 2`): no resume ni
atribuye texto a ninguna persona.

Con defaults centralizados, corta solo después de la duración mínima: ante un
gap grande (`gap`), ante cambio de speaker después de la duración objetivo
(`speaker_change`) o al alcanzar la duración máxima (`duration_threshold`).
También respeta un máximo de propuestas. Las opciones permiten ajustar esas
duraciones sin alterar el contrato de salida.

## Flujo futuro

1. Importar o recuperar un `Transcript` validado.
2. Generar propuestas y revisar evidencia, título y tiempos.
3. Aceptar explícitamente cada propuesta seleccionada.
4. Convertirlas en memoria y persistir/publicar solo mediante una acción
   editorial futura separada.

`ChapterProposalProvider` es el punto de sustitución: un proveedor de IA podrá
devolver el mismo `ChapterProposalGenerationResult` que el proveedor local, sin
acoplar la interfaz, persistencia o validación a un modelo concreto. Esta fase
no conecta SSK, Automation, APIs remotas, base de datos ni publicación
automática.
