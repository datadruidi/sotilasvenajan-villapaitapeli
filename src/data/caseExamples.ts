import { CASE_IDS } from '../types/cases'
import type { CaseForms, CaseNoun, GrammaticalNumber, RussianCase } from '../types/cases'
import type { SingularExercise } from './singularExercises'

function forms(words: string): CaseForms {
  return Object.fromEntries(words.split(' ').map((word, index) => [CASE_IDS[index], word.split('/')])) as CaseForms
}

function exampleNoun(lemma: string, fi: string, en: string, gender: CaseNoun['gender'], animate: boolean, singular: string, plural: string): CaseNoun {
  return {
    id: `example-${lemma}`, lemma, gender, animate, translations: { fi, en }, sources: [],
    forms: { singular: forms(singular), plural: forms(plural) },
  }
}

export const CASE_EXAMPLE_NOUNS = [
  exampleNoun('приказ', 'käsky', 'order', 'masculine', false, 'приказ приказа приказу приказ приказом приказе', 'приказы приказов приказам приказы приказами приказах'),
  exampleNoun('офицер', 'upseeri', 'officer', 'masculine', true, 'офицер офицера офицеру офицера офицером офицере', 'офицеры офицеров офицерам офицеров офицерами офицерах'),
  exampleNoun('здание', 'rakennus', 'building', 'neuter', false, 'здание здания зданию здание зданием здании', 'здания зданий зданиям здания зданиями зданиях'),
  exampleNoun('командование', 'johto', 'command staff', 'neuter', false, 'командование командования командованию командование командованием командовании', 'командования командований командованиям командования командованиями командованиях'),
  exampleNoun('радиостанция', 'radioasema', 'radio station', 'feminine', false, 'радиостанция радиостанции радиостанции радиостанцию радиостанцией/радиостанциею радиостанции', 'радиостанции радиостанций радиостанциям радиостанции радиостанциями радиостанциях'),
  exampleNoun('артиллерия', 'tykistö', 'artillery', 'feminine', false, 'артиллерия артиллерии артиллерии артиллерию артиллерией/артиллериею артиллерии', 'артиллерии артиллерий артиллериям артиллерии артиллериями артиллериях'),
  exampleNoun('генерал', 'kenraali', 'general', 'masculine', true, 'генерал генерала генералу генерала генералом генерале', 'генералы генералов генералам генералов генералами генералах'),
]

export interface CaseExample extends SingularExercise {
  number: GrammaticalNumber
  caseId: RussianCase
}

type Example = [lemma: string, ru: string, fi: string, en: string, explanation: string]

function examples(caseId: RussianCase, number: GrammaticalNumber, items: Example[]): CaseExample[] {
  return items.map(([lemma, ru, fi, en, explanation], index) => ({
    id: `example-${caseId}-${number}-${index}`, caseId, number, lemma, ru, fi, en, explanation,
    difficulty: (['easy', 'medium', 'hard'] as const)[index % 3],
  }))
}

export const CASE_EXAMPLES = [
  ...examples('nominative', 'singular', [
    ['артиллерия', '___ готова.', 'Tykistö on valmis.', 'The artillery is ready.', 'Lauseen subjekti on nominatiivissa.'],
    ['разведчик', '___ находится здесь.', 'Tiedustelija on täällä.', 'The scout is here.', 'Lauseen subjekti on nominatiivissa.'],
  ]),
  ...examples('nominative', 'plural', [
    ['подразделение', '___ готовы.', 'Yksiköt ovat valmiina.', 'The units are ready.', 'Monikollinen subjekti on nominatiivissa.'],
    ['офицер', '___ находятся здесь.', 'Upseerit ovat täällä.', 'The officers are here.', 'Monikollinen subjekti on nominatiivissa.'],
  ]),
  ...examples('genitive', 'singular', [
    ['район', 'Это карта ___.', 'Tämä on alueen kartta.', 'This is a map of the area.', 'Genetiivi kertoo, mitä aluetta kartta esittää.'],
    ['солдат', 'Это оружие ___.', 'Tämä on sotilaan ase.', 'This is the soldier’s weapon.', 'Genetiivi ilmaisee omistajaa.'],
    ['наступление', 'Это начало ___.', 'Tämä on hyökkäyksen alku.', 'This is the start of the offensive.', 'Genetiivi kertoo, minkä alusta on kyse.'],
    ['генерал', 'Это приказ ___.', 'Tämä on kenraalin käsky.', 'This is the general’s order.', 'Genetiivi kertoo, kenen käskystä on kyse.'],
  ]),
  ...examples('dative', 'singular', [
    ['командир', 'Солдат помогает ___.', 'Sotilas auttaa komentajaa.', 'The soldier helps the commander.', 'Помогать vaatii datiivin.'],
    ['командование', 'Разведчик передаёт информацию ___.', 'Tiedustelija välittää tietoa johdolle.', 'The scout passes information to the command staff.', 'Datiivi ilmaisee tiedon vastaanottajaa.'],
    ['подразделение', 'Командир помогает ___.', 'Komentaja auttaa yksikköä.', 'The commander helps the unit.', 'Помогать vaatii datiivin.'],
  ]),
  ...examples('accusative', 'singular', [
    ['приказ', 'Командир получил ___.', 'Komentaja sai käskyn.', 'The commander received an order.', 'Saatu asia on akkusatiivissa.'],
    ['местность', 'Мы изучаем ___.', 'Tutkimme maastoa.', 'We are studying the terrain.', 'Tutkimisen kohde on akkusatiivissa.'],
    ['разведчик', 'Командир видит ___.', 'Komentaja näkee tiedustelijan.', 'The commander sees the scout.', 'Näkemisen kohde on akkusatiivissa.'],
    ['позиция', 'Войска идут на ___.', 'Joukot menevät asemiin.', 'The troops are moving into position.', 'На ja akkusatiivi ilmaisevat liikkeen määränpäätä.'],
  ]),
  ...examples('instrumental', 'singular', [
    ['офицер', 'Разведчик говорит с ___.', 'Tiedustelija puhuu upseerin kanssa.', 'The scout speaks with the officer.', 'С vaatii instrumentaalin, kun se tarkoittaa jonkun kanssa.'],
    ['радиостанция', 'Солдат работает с ___.', 'Sotilas työskentelee radioasemalla.', 'The soldier works with the radio station.', 'Работать с vaatii instrumentaalin.'],
    ['машина', 'Солдат управляет ___.', 'Sotilas ajaa ajoneuvoa.', 'The soldier drives the vehicle.', 'Управлять vaatii instrumentaalin.'],
  ]),
  ...examples('prepositional', 'singular', [
    ['здание', 'Разведка находится в ___.', 'Tiedustelu on rakennuksessa.', 'The reconnaissance team is in the building.', 'В ja prepositionaali ilmaisevat sijaintia.'],
    ['задача', 'Командир говорит о ___.', 'Komentaja puhuu tehtävästä.', 'The commander speaks about the task.', 'О ja prepositionaali ilmaisevat puheen aihetta.'],
    ['позиция', 'Разведчик находится на ___.', 'Tiedustelija on asemassa.', 'The scout is in position.', 'На ja prepositionaali ilmaisevat sijaintia.'],
  ]),
  ...examples('genitive', 'plural', [
    ['солдат', 'Это палатка ___.', 'Tämä on sotilaiden teltta.', 'This is the soldiers’ tent.', 'Genetiivi ilmaisee omistajaa.'],
  ]),
  ...examples('dative', 'plural', [
    ['командир', 'Офицер передаёт приказ ___.', 'Upseeri välittää käskyn komentajille.', 'The officer passes the order to the commanders.', 'Datiivi ilmaisee vastaanottajaa.'],
  ]),
  ...examples('accusative', 'plural', [
    ['машина', 'Механик проверяет ___.', 'Mekaanikko tarkastaa ajoneuvoja.', 'The mechanic is checking the vehicles.', 'Tarkastuksen kohde on akkusatiivissa.'],
  ]),
  ...examples('instrumental', 'plural', [
    ['солдат', 'Командир говорит с ___.', 'Komentaja puhuu sotilaiden kanssa.', 'The commander speaks with the soldiers.', 'С vaatii instrumentaalin, kun se tarkoittaa jonkun kanssa.'],
  ]),
  ...examples('prepositional', 'plural', [
    ['задача', 'Командир напоминает о ___.', 'Komentaja muistuttaa tehtävistä.', 'The commander reminds them about the tasks.', 'О ja prepositionaali ilmaisevat muistutuksen aihetta.'],
  ]),
]

const examplesById = new Map(CASE_EXAMPLES.map(exercise => [exercise.id, exercise]))

export function caseExample(id: string): CaseExample | undefined {
  return examplesById.get(id)
}
