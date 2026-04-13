import type { Profile } from '../store/appStore'

export function buildJournalMarkdown(
  profile: Profile,
  date: string,
  userSnippets: string[],
): string {
  const snip =
    userSnippets.length > 0
      ? userSnippets.map((s, i) => `- (${i + 1}) ${s}`).join('\n')
      : '- (brak bezpośrednich wzmianek użytkownika o tym dniu w skrócie — model uzupełni z pełnej historii)'

  return [
    `## Esencja astrologiczna — ${date}`,
    '',
    `Profil: **${profile.name}**. Poniżej **automatyczna synteza (demo)**: w produkcji model łączy tranzyty dnia, bazę wiedzy profilu (JSON/MD) oraz to, co przekazałeś w rozmowach.`,
    '',
    '### Klucz dnia (symulacja)',
    '- Napięcie społeczne / komunikacja: możliwe krótkie piki — warto planować przerwy.',
    '- Okno na intuicję: popołudnie jako miejsce na decyzje „miękkie”, nie twarde kontrakty.',
    '',
    '### Od Ciebie (fragmenty)',
    snip,
    '',
    '---',
    '*Wersja produkcyjna: wpis generowany przez AI z pełnym RAG po historii i materiałach.*',
  ].join('\n')
}
