import type { Profile } from '../store/appStore'

/** Struktura pod RAG / narzędzia — pełna analiza zostanie uzupełniona przez silnik + model. */
export function buildBaselineDocuments(profile: Profile): { json: string; markdown: string } {
  const generatedAt = new Date().toISOString()
  const payload = {
    schemaVersion: 1,
    profileId: profile.id,
    profileName: profile.name,
    generatedAt,
    birth: {
      date: profile.birthDate ?? null,
      time: profile.birthTime ?? null,
      place: profile.birthPlace ?? null,
    },
    systems: {
      tropical: { note: 'Pozycje tropikalne — do wyliczenia z efemerydy (pyswisseph / API).' },
      sidereal: { ayanamsa: 'Lahiri', note: 'Mapa syderyczna + nakshatry po wyliczeniu.' },
      numerology: { note: 'Ścieżka życia, rok osobisty — po integracji.' },
      tarot: { note: 'Karta dnia / rozłożenia — opcjonalnie.' },
    },
    materials: {
      baselineJson: true,
      baselineMarkdown: true,
    },
    embedding: {
      note: 'Fragmenty tego JSON i MD są indeksowane jako baza wiedzy profilu dla modelu.',
    },
  }

  const json = JSON.stringify(payload, null, 2)

  const markdown = [
    `# Pełna analiza bazowa — ${profile.name}`,
    '',
    `Wygenerowano: ${generatedAt}`,
    '',
    '## Dane wejściowe',
    `- Data urodzenia: ${profile.birthDate ?? '—'}`,
    `- Godzina: ${profile.birthTime ?? '—'}`,
    `- Miejsce: ${profile.birthPlace ?? '—'}`,
    '',
    '## Zakres (głęboka analiza)',
    'Ten dokument jest **materiałem bazowym** w Markdown: astrologia wielosystemowa, dopasowanie do numerologii i innych tradycji wykonuje model po podłączeniu silnika obliczeniowego.',
    '',
    '### Następne kroki techniczne',
    '1. Wyliczenie karty natalnej (tropikalna / syderyczna), domy, aspekty.',
    '2. Zapis wyników do tej bazy + embeddingi dla RAG.',
    '3. Konwersacje korzystają z tej wiedzy przy pytaniach typu „co u mnie dziś w horoskopie”.',
    '',
    '---',
    '*Równolegle dostępny jest plik JSON ze strukturalnym zapisem (ten sam profil).*',
  ].join('\n')

  return { json, markdown }
}
