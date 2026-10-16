import type { CaseNoun, GrammaticalNumber, RussianCase } from '../types/cases'

interface SentenceTemplate {
  id: string
  ru: string
  fi: string
  en: string
  singularOnly?: boolean
  locationsOnly?: boolean
  animateOnly?: boolean
  nouns?: readonly string[]
}

// Ordinary prepositional forms work with в for these nouns. Exclude special
// locatives (в лесу, на мосту) and nouns that require a different preposition.
const LOCATION_NOUNS = new Set([
  'машина', 'кабина', 'деревня', 'район', 'море', 'штаб', 'армия', 'рота',
  'батальон', 'полк', 'бригада', 'дивизия', 'взвод', 'экипаж', 'батарея', 'дивизион',
])

export const CASE_SENTENCE_TEMPLATES: Record<RussianCase, readonly SentenceTemplate[]> = {
  nominative: [
    { id: 'here', ru: 'Здесь {word}.', fi: 'Tässä on {nom}.', en: 'Here {is} the {noun}.' },
    { id: 'identify', ru: 'Это {word}.', fi: 'Tämä on {nom}.', en: 'This {is} the {noun}.' },
    { id: 'have', ru: 'У нас есть {word}.', fi: 'Meillä on {nom}.', en: 'We have the {noun}.' },
    { id: 'point', ru: 'Вот {word}.', fi: 'Tässä on {nom}.', en: 'Here {is} the {noun}.' },
  ],
  genitive: [
    { id: 'absence', ru: 'Здесь нет {word}.', fi: 'Täällä ei ole {part}.', en: 'The {noun} {is} missing here.' },
    { id: 'without', ru: 'Мы здесь без {word}.', fi: 'Olemme täällä ilman {part}.', en: 'We are here without the {noun}.' },
    { id: 'purpose', ru: 'Это для {word}.', fi: 'Tämä on {part} varten.', en: 'This is for the {noun}.' },
    { id: 'description', ru: 'Это описание {word}.', fi: 'Tämä on kuvaus {elat}.', en: 'This is a description of the {noun}.' },
    { id: 'possession', ru: 'Это вещь {word}.', fi: 'Tämä on {gen} tavara.', en: 'This belongs to the {noun}.', singularOnly: true, animateOnly: true },
    { id: 'origin', ru: 'Это из {word}.', fi: 'Tämä on peräisin {elat}.', en: 'This is from the {noun}.', locationsOnly: true },
  ],
  dative: [
    { id: 'glad', ru: 'Я рад {word}.', fi: 'Iloitsen {elat}.', en: 'I am glad about the {noun}.' },
    { id: 'help', ru: 'Это помогает {word}.', fi: 'Tästä on apua {all}.', en: 'This helps the {noun}.' },
    { id: 'recipient', ru: 'Я даю {word} шанс.', fi: 'Annan {all} mahdollisuuden.', en: 'I give the {noun} a chance.' },
    { id: 'approach', ru: 'Я иду {dativeContext}.', fi: 'Kuljen {part} kohti.', en: 'I am walking towards the {noun}.' },
  ],
  accusative: [
    { id: 'see', ru: 'Я вижу {word}.', fi: 'Näen {part}.', en: 'I see the {noun}.' },
    { id: 'seek', ru: 'Я ищу {word}.', fi: 'Etsin {part}.', en: 'I am looking for the {noun}.' },
    { id: 'study', ru: 'Я изучаю {word}.', fi: 'Tutkin {part}.', en: 'I am studying the {noun}.' },
    { id: 'look', ru: 'Я смотрю на {word}.', fi: 'Katson {part} kohti.', en: 'I am looking at the {noun}.' },
    { id: 'cross', ru: 'Я иду через {word}.', fi: 'Kuljen {gen} läpi.', en: 'I am walking through the {noun}.', singularOnly: true, nouns: ['деревня', 'район'] },
  ],
  instrumental: [
    { id: 'interest', ru: 'Я интересуюсь {word}.', fi: 'Olen kiinnostunut {elat}.', en: 'I am interested in the {noun}.' },
    { id: 'use', ru: 'Я пользуюсь {word}.', fi: 'Käytän {part}.', en: 'I use the {noun}.' },
    { id: 'pride', ru: 'Я горжусь {word}.', fi: 'Olen ylpeä {elat}.', en: 'I am proud of the {noun}.' },
    { id: 'company', ru: 'Я иду {instrumentalContext}.', fi: 'Kuljen {gen} kanssa.', en: 'I am walking with the {noun}.', singularOnly: true, animateOnly: true },
  ],
  prepositional: [
    { id: 'talk', ru: 'Я говорю {prepositionalContext}.', fi: 'Puhun {elat}.', en: 'I am talking about the {noun}.' },
    { id: 'think', ru: 'Я думаю {prepositionalContext}.', fi: 'Ajattelen {part}.', en: 'I am thinking about the {noun}.' },
    { id: 'know', ru: 'Я знаю {prepositionalContext}.', fi: 'Tiedän {elat}.', en: 'I know about the {noun}.' },
    { id: 'location', ru: 'Мы {in} {word}.', fi: 'Olemme {iness}.', en: 'We are in the {noun}.', locationsOnly: true },
  ],
}

export function getCaseTemplates(noun: CaseNoun, number: GrammaticalNumber, caseId: RussianCase): SentenceTemplate[] {
  return CASE_SENTENCE_TEMPLATES[caseId].filter(template =>
    (!template.singularOnly || (number === 'singular' && noun.lemma !== 'форсирование')) &&
    (!template.locationsOnly || LOCATION_NOUNS.has(noun.lemma)) &&
    (!template.animateOnly || noun.animate) &&
    (!template.nouns || template.nouns.includes(noun.lemma)),
  )
}
