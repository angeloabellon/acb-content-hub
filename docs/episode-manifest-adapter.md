# Manifest → Episode (read-only boundary)

`lib/episode-manifest-adapter.ts` is deliberately a parser and transformer only.
It does not read `CTC_WORK`, scan directories, write Automation data, call an API,
or change any Next route.

## Current contract

The web repository had no real `<ID>_EPISODIO.json` file or shared Automation
schema at the time this adapter was added. The supported 1.0 and 1.1 fixture
contract is intentionally small and must be reconciled against one sanitized
real export before a source is connected:

```json
{
  "schema_version": "1.1",
  "episodio": {
    "id": "CTC_T5E02",
    "tipo": "regular | especial | entrevista",
    "temporada": 5,
    "numero": 2,
    "titulo": "...",
    "descripcion": "...",
    "fecha": "YYYY-MM-DD",
    "participantes": [{ "nombre": "...", "rol": "..." }]
  },
  "publicacion": {
    "thumbnail": "https://...",
    "plataformas": {
      "youtube": "https://...",
      "ivoox": "https://...",
      "apple_podcasts": "https://...",
      "spotify": "https://..."
    }
  }
}
```

Only public `http(s)` URLs are exposed. Unknown schemas cause an explicit
`EpisodeManifestValidationError`; unknown fields are ignored; missing or
invalid mapped fields become diagnostics and are never guessed.

`parseEpisodeManifest(input)` returns the validated manifest projection.
`episodeFromManifest(manifest, overrides)` returns both the non-invented
partial projection and an `Episode` only when the public model is complete.

## Precedence

The manifest is authoritative for technical identity and publication data:
`id`, type, season, episode number, date and platform URLs. Web editorial
overrides are intentionally limited to presentation and web-only material:
slug, title, description, thumbnail, participants and future editorial
modules. This keeps `data/episodes.ts` valid as the manual fallback during the
transition without giving it a competing technical identity.

## Mapping status

| Web field | Fixture contract path | Status |
| --- | --- | --- |
| ID, type, season, episode number | `episodio.*` | implemented |
| Title, description, date, participants | `episodio.*` | implemented when present |
| Thumbnail and platform links | `publicacion.*` | implemented when public URL is valid |
| Chapters, transcript, subtitles, derived/related content | none | intentionally pending |

The existing Copa del 96 pilot remains manual in `data/episodes.ts`. It is not
rebuilt from a fixture yet because the real Automation shape is unavailable in
this repository; connecting it now would falsely present the fixture as a
production source.
