import type { RussianCase } from '../types/cases'

export interface SingularExercise {
  id: string
  lemma: string
  ru: string
  fi: string
  en: string
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
  form?: string
}

// Ten syntactic frames per case, each in ten translated operational contexts.
const contexts = [
  ['', '', ''],
  ['На учениях ', 'Harjoituksessa ', 'During the exercise, '],
  ['Утром ', 'Aamulla ', 'In the morning, '],
  ['После проверки ', 'Tarkastuksen jälkeen ', 'After the inspection, '],
  ['Перед маршем ', 'Ennen marssia ', 'Before the march, '],
  ['Сегодня ', 'Tänään ', 'Today, '],
  ['Вечером ', 'Illalla ', 'In the evening, '],
  ['На базе ', 'Tukikohdassa ', 'At the base, '],
  ['После учений ', 'Harjoituksen jälkeen ', 'After the exercise, '],
  ['По прибытии ', 'Saapumisen jälkeen ', 'On arrival, '],
] as const

const frames: Record<RussianCase, readonly (readonly string[])[]> = {
  "nominative": [
    [
      "командир",
      "___ получил приказ.",
      "Komentaja sai käskyn.",
      "The commander received an order.",
      "Tekijä on lauseen subjekti."
    ],
    [
      "рота",
      "___ наступает.",
      "Komppania hyökkää.",
      "The company is advancing.",
      "Toimiva joukko on lauseen subjekti."
    ],
    [
      "танк",
      "На дороге стоит ___.",
      "Tiellä seisoo panssarivaunu.",
      "A tank stands on the road.",
      "Seisova ajoneuvo on subjekti myös verbin jäljessä."
    ],
    [
      "подразделение",
      "___ готово к маршу.",
      "Yksikkö on valmis marssiin.",
      "The unit is ready for the march.",
      "Olla-rakenteen subjekti on nominatiivissa."
    ],
    [
      "разведчик",
      "___ передал донесение.",
      "Tiedustelija välitti ilmoituksen.",
      "The scout relayed a report.",
      "Ilmoituksen välittäjä on subjekti."
    ],
    [
      "машина",
      "У штаба остановилась ___.",
      "Esikunnan luo pysähtyi ajoneuvo.",
      "A vehicle stopped near headquarters.",
      "Pysähtyvä ajoneuvo on subjekti."
    ],
    [
      "орудие",
      "___ находится на позиции.",
      "Tykki on asemassa.",
      "The gun is in position.",
      "Sijainnin ilmaisevan lauseen subjekti on nominatiivissa."
    ],
    [
      "переправа",
      "У нас есть ___.",
      "Meillä on ylityspaikka.",
      "We have a crossing.",
      "У нас есть ilmaisee olemassaoloa; asia on nominatiivissa."
    ],
    [
      "наблюдатель",
      "На холме остался ___.",
      "Kukkulalle jäi tähystäjä.",
      "An observer remained on the hill.",
      "Paikalle jäävä henkilö on subjekti."
    ],
    [
      "задание",
      "Это учебное ___.",
      "Tämä on harjoitustehtävä.",
      "This is a training assignment.",
      "Это-rakenteessa nimeävä sana on nominatiivissa."
    ]
  ],
  "genitive": [
    [
      "автомат",
      "У солдата нет ___.",
      "Sotilaalla ei ole rynnäkkökivääriä.",
      "The soldier has no assault rifle.",
      "Нет-rakenne vaatii genetiivin."
    ],
    [
      "противник",
      "Это позиция ___.",
      "Tämä on vihollisen asema.",
      "This is the enemy’s position.",
      "Omistaja ilmaistaan genetiivillä."
    ],
    [
      "разведка",
      "После ___ началось наступление.",
      "Tiedustelun jälkeen alkoi hyökkäys.",
      "The offensive began after reconnaissance.",
      "После vaatii genetiivin."
    ],
    [
      "командир",
      "Пакет предназначен для ___.",
      "Paketti on tarkoitettu komentajalle.",
      "The package is intended for the commander.",
      "Для vaatii genetiivin."
    ],
    [
      "мост",
      "Колонна остановилась возле ___.",
      "Kolonna pysähtyi sillan lähelle.",
      "The column stopped near the bridge.",
      "Возле vaatii genetiivin."
    ],
    [
      "лес",
      "Разведчик вышел из ___.",
      "Tiedustelija tuli ulos metsästä.",
      "The scout came out of the forest.",
      "Из ilmaisee lähtöpaikkaa ja vaatii genetiivin."
    ],
    [
      "прикрытие",
      "Группа осталась без ___.",
      "Ryhmä jäi ilman suojausta.",
      "The group was left without cover.",
      "Без vaatii genetiivin."
    ],
    [
      "рота",
      "Половина ___ осталась в резерве.",
      "Puolet komppaniasta jäi reserviin.",
      "Half of the company remained in reserve.",
      "Половина-sanan jäljessä kokonaisuus on genetiivissä."
    ],
    [
      "подразделение",
      "Командир проверил готовность ___.",
      "Komentaja tarkisti yksikön valmiuden.",
      "The commander checked the unit’s readiness.",
      "Valmiuden haltija ilmaistaan genetiivillä."
    ],
    [
      "атака",
      "До ___ оставался час.",
      "Hyökkäykseen oli tunti aikaa.",
      "An hour remained until the attack.",
      "До vaatii genetiivin."
    ]
  ],
  "dative": [
    [
      "солдат",
      "Командир дал приказ ___.",
      "Komentaja antoi käskyn sotilaalle.",
      "The commander gave an order to the soldier.",
      "Käskyn vastaanottaja on datiivissa."
    ],
    [
      "разведчик",
      "Офицер передал карту ___.",
      "Upseeri antoi kartan tiedustelijalle.",
      "The officer handed the map to the scout.",
      "Antamisen vastaanottaja on datiivissa."
    ],
    [
      "мост",
      "Колонна подошла к ___.",
      "Kolonna saapui sillan luo.",
      "The column approached the bridge.",
      "К vaatii datiivin."
    ],
    [
      "боец",
      "Санитар помог ___.",
      "Lääkintämies auttoi taistelijaa.",
      "The medic helped the fighter.",
      "Помочь vaatii autettavan datiiviin."
    ],
    [
      "рота",
      "Штаб поставил ___ новую задачу.",
      "Esikunta antoi komppanialle uuden tehtävän.",
      "Headquarters assigned the company a new task.",
      "Tehtävän saava joukko on datiivissa."
    ],
    [
      "подразделение",
      "Резерв пришёл на помощь ___.",
      "Reservi tuli yksikön avuksi.",
      "The reserve came to the unit’s aid.",
      "Прийти на помощь ilmaisee avun saajan datiivilla."
    ],
    [
      "командир",
      "Разведчик доложил ___ обстановку.",
      "Tiedustelija raportoi komentajalle tilanteen.",
      "The scout reported the situation to the commander.",
      "Доложить кому: raportin vastaanottaja on datiivissa."
    ],
    [
      "деревня",
      "Патруль направился к ___.",
      "Partio lähti kohti kylää.",
      "The patrol headed towards the village.",
      "К ilmaisee suuntaa ja vaatii datiivin."
    ],
    [
      "орудие",
      "Расчёт подбежал к ___.",
      "Tykkimiehistö juoksi tykin luo.",
      "The gun crew ran up to the gun.",
      "К vaatii datiivin myös neutrisanalta."
    ],
    [
      "армия",
      "Флот оказал ___ поддержку.",
      "Laivasto antoi armeijalle tukea.",
      "The fleet provided support to the army.",
      "Оказать поддержку кому: tuen saaja on datiivissa."
    ]
  ],
  "accusative": [
    [
      "противник",
      "Разведчик обнаружил ___.",
      "Tiedustelija havaitsi vihollisen.",
      "The scout detected the enemy.",
      "Tekemisen kohde on akkusatiivissa; elollisen maskuliinin muoto vastaa genetiiviä."
    ],
    [
      "танк",
      "Механик осмотрел ___.",
      "Mekaanikko tarkasti panssarivaunun.",
      "The mechanic inspected the tank.",
      "Elottoman maskuliinin akkusatiivi vastaa nominatiivia."
    ],
    [
      "деревня",
      "Рота вошла в ___.",
      "Komppania saapui kylään.",
      "The company entered the village.",
      "В + akkusatiivi ilmaisee liikkeen määränpäätä."
    ],
    [
      "позиция",
      "Батарея вышла на ___.",
      "Patteri siirtyi asemaan.",
      "The battery moved into position.",
      "На + akkusatiivi ilmaisee liikkeen suuntaa."
    ],
    [
      "орудие",
      "Расчёт замаскировал ___.",
      "Tykkimiehistö naamioi tykin.",
      "The gun crew camouflaged the gun.",
      "Suora objekti on akkusatiivissa; neutrin muoto vastaa nominatiivia."
    ],
    [
      "река",
      "Взвод пересёк ___.",
      "Joukkue ylitti joen.",
      "The platoon crossed the river.",
      "Пересечь-verbin suora objekti on akkusatiivissa."
    ],
    [
      "командир",
      "Солдат увидел ___.",
      "Sotilas näki komentajan.",
      "The soldier saw the commander.",
      "Elollisen maskuliiniobjektin akkusatiivi vastaa genetiiviä."
    ],
    [
      "задание",
      "Подразделение выполнило ___.",
      "Yksikkö suoritti tehtävän.",
      "The unit completed the assignment.",
      "Suoritettu tehtävä on suora objekti akkusatiivissa."
    ],
    [
      "лес",
      "Патруль вошёл в ___.",
      "Partio meni metsään.",
      "The patrol entered the forest.",
      "В + akkusatiivi ilmaisee suuntaa: в лес."
    ],
    [
      "граната",
      "Наблюдатель заметил ___.",
      "Tähystäjä huomasi käsikranaatin.",
      "The observer noticed the grenade.",
      "Заметить-verbin objekti on akkusatiivissa."
    ]
  ],
  "instrumental": [
    [
      "командир",
      "Разведчик встретился с ___.",
      "Tiedustelija tapasi komentajan.",
      "The scout met with the commander.",
      "Встретиться с vaatii instrumentaalin."
    ],
    [
      "компас",
      "Разведчик пользовался ___.",
      "Tiedustelija käytti kompassia.",
      "The scout used a compass.",
      "Пользоваться vaatii instrumentaalin."
    ],
    [
      "подразделение",
      "Офицер руководил ___.",
      "Upseeri johti yksikköä.",
      "The officer led the unit.",
      "Руководить vaatii instrumentaalin."
    ],
    [
      "рота",
      "Капитан командовал ___.",
      "Kapteeni komensi komppaniaa.",
      "The captain commanded the company.",
      "Командовать vaatii instrumentaalin."
    ],
    [
      "противник",
      "Солдат наблюдал за ___.",
      "Sotilas tarkkaili vihollista.",
      "The soldier observed the enemy.",
      "Наблюдать за vaatii instrumentaalin."
    ],
    [
      "машина",
      "Водитель управлял ___.",
      "Kuljettaja ohjasi ajoneuvoa.",
      "The driver operated the vehicle.",
      "Управлять vaatii instrumentaalin."
    ],
    [
      "орудие",
      "Механик работал над ___.",
      "Mekaanikko työskenteli tykin parissa.",
      "The mechanic worked on the gun.",
      "Работать над vaatii instrumentaalin."
    ],
    [
      "сапёр",
      "Разведчик шёл рядом с ___.",
      "Tiedustelija kulki pioneerin vieressä.",
      "The scout walked beside the combat engineer.",
      "Рядом с vaatii instrumentaalin."
    ],
    [
      "автомат",
      "Часовой стоял с ___.",
      "Vartiomies seisoi rynnäkkökiväärin kanssa.",
      "The sentry stood with an assault rifle.",
      "С ilmaisee mukana olevaa varustetta ja vaatii instrumentaalin."
    ],
    [
      "мост",
      "Вертолёт пролетел над ___.",
      "Helikopteri lensi sillan yli.",
      "The helicopter flew over the bridge.",
      "Над vaatii instrumentaalin."
    ]
  ],
  "prepositional": [
    [
      "лес",
      "Подразделение находится в ___.",
      "Yksikkö on metsässä.",
      "The unit is in the forest.",
      "Sijainti ilmaistaan tässä poikkeavalla paikallismuodolla: в лесу."
    ],
    [
      "задача",
      "Командир говорил о ___.",
      "Komentaja puhui tehtävästä.",
      "The commander spoke about the task.",
      "О vaatii prepositionaalin."
    ],
    [
      "дорога",
      "Танк стоит на ___.",
      "Panssarivaunu seisoo tiellä.",
      "The tank stands on the road.",
      "На + prepositionaali ilmaisee sijaintia."
    ],
    [
      "штаб",
      "Совещание проходит в ___.",
      "Kokous pidetään esikunnassa.",
      "The meeting takes place at headquarters.",
      "В + prepositionaali ilmaisee tapahtumapaikan."
    ],
    [
      "подразделение",
      "Офицер служит в ___.",
      "Upseeri palvelee yksikössä.",
      "The officer serves in the unit.",
      "В + prepositionaali ilmaisee palveluspaikan."
    ],
    [
      "противник",
      "Разведчик доложил о ___.",
      "Tiedustelija raportoi vihollisesta.",
      "The scout reported on the enemy.",
      "О ilmaisee puheen aihetta ja vaatii prepositionaalin."
    ],
    [
      "машина",
      "Радиостанция находится в ___.",
      "Radioasema on ajoneuvossa.",
      "The radio is in the vehicle.",
      "В + prepositionaali ilmaisee sijaintia."
    ],
    [
      "поле",
      "Наблюдатель остался на ___.",
      "Tähystäjä jäi pellolle.",
      "The observer remained in the field.",
      "Остаться на ilmaisee paikalle jäämistä ja käyttää prepositionaalia."
    ],
    [
      "командир",
      "Солдат рассказал о ___.",
      "Sotilas kertoi komentajasta.",
      "The soldier spoke about the commander.",
      "Рассказать о vaatii prepositionaalin."
    ],
    [
      "мост",
      "Часовой стоит на ___.",
      "Vartiomies seisoo sillalla.",
      "The sentry stands on the bridge.",
      "Sijainti ilmaistaan tässä poikkeavalla paikallismuodolla: на мосту."
    ]
  ]
}

export const SINGULAR_EXERCISES: Record<RussianCase, SingularExercise[]> = Object.fromEntries(
  Object.entries(frames).map(([caseId, items]) => [caseId, contexts.flatMap(([ru, fi, en], contextIndex) =>
    items.map(([lemma, sentence, finnish, english, explanation], index) => ({
      id: `singular-${caseId}-${contextIndex}-${index}`, lemma,
      ru: ru + (ru && !sentence.startsWith('___') ? sentence[0].toLocaleLowerCase('ru') + sentence.slice(1) : sentence),
      fi: fi + (fi ? finnish[0].toLocaleLowerCase('fi') + finnish.slice(1) : finnish),
      en: en + (en && !english.startsWith('I ') ? english[0].toLocaleLowerCase('en') + english.slice(1) : english),
      explanation,
      difficulty: contextIndex < 3 ? 'easy' : contextIndex < 7 ? 'medium' : 'hard',
      ...(caseId === 'prepositional' && lemma === 'лес' ? { form: 'лесу' } : {}),
      ...(caseId === 'prepositional' && lemma === 'мост' ? { form: 'мосту' } : {}),
    }))),
  ]),
) as Record<RussianCase, SingularExercise[]>

export function singularExercise(id: string): SingularExercise | undefined {
  return Object.values(SINGULAR_EXERCISES).flat().find(item => item.id === id)
}
