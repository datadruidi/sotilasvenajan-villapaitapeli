import { CASE_IDS } from '../types/cases'
import type { CaseForms, CaseNoun, GrammaticalNumber, RussianCase } from '../types/cases'
import type { SingularExercise } from './singularExercises'

function forms(words: string): CaseForms {
  return Object.fromEntries(words.split(' ').map((word, index) => [CASE_IDS[index], word.split('/')])) as CaseForms
}

function exampleNoun(lemma: string, fi: string, en: string, gender: CaseNoun['gender'], animate: boolean, singular: string, plural: string, idPrefix = 'example'): CaseNoun {
  return {
    id: `${idPrefix}-${lemma}`, lemma, gender, animate, translations: { fi, en }, sources: [],
    forms: { singular: forms(singular), plural: forms(plural) },
  }
}

export const CASE_EXAMPLE_NOUNS = [
  exampleNoun('дом', 'talo', 'house', 'masculine', false, 'дом дома дому дом домом доме', 'дома домов домам дома домами домах'),
  exampleNoun('приказ', 'käsky', 'order', 'masculine', false, 'приказ приказа приказу приказ приказом приказе', 'приказы приказов приказам приказы приказами приказах'),
  exampleNoun('офицер', 'upseeri', 'officer', 'masculine', true, 'офицер офицера офицеру офицера офицером офицере', 'офицеры офицеров офицерам офицеров офицерами офицерах'),
  exampleNoun('здание', 'rakennus', 'building', 'neuter', false, 'здание здания зданию здание зданием здании', 'здания зданий зданиям здания зданиями зданиях'),
  exampleNoun('командование', 'johto', 'command staff', 'neuter', false, 'командование командования командованию командование командованием командовании', 'командования командований командованиям командования командованиями командованиях'),
  exampleNoun('радиостанция', 'radioasema', 'radio station', 'feminine', false, 'радиостанция радиостанции радиостанции радиостанцию радиостанцией/радиостанциею радиостанции', 'радиостанции радиостанций радиостанциям радиостанции радиостанциями радиостанциях'),
  exampleNoun('артиллерия', 'tykistö', 'artillery', 'feminine', false, 'артиллерия артиллерии артиллерии артиллерию артиллерией/артиллериею артиллерии', 'артиллерии артиллерий артиллериям артиллерии артиллериями артиллериях'),
  exampleNoun('генерал', 'kenraali', 'general', 'masculine', true, 'генерал генерала генералу генерала генералом генерале', 'генералы генералов генералам генералов генералами генералах'),
]

export const CASE_ADDITIONAL_NOUNS = [
  exampleNoun('ангар', 'halli', 'hangar', 'masculine', false, 'ангар ангара ангару ангар ангаром ангаре', 'ангары ангаров ангарам ангары ангарами ангарах', 'additional'),
  exampleNoun('гараж', 'autotalli', 'garage', 'masculine', false, 'гараж гаража гаражу гараж гаражом гараже', 'гаражи гаражей гаражам гаражи гаражами гаражах', 'additional'),
  exampleNoun('карман', 'tasku', 'pocket', 'masculine', false, 'карман кармана карману карман карманом кармане', 'карманы карманов карманам карманы карманами карманах', 'additional'),
  exampleNoun('рюкзак', 'reppu', 'backpack', 'masculine', false, 'рюкзак рюкзака рюкзаку рюкзак рюкзаком рюкзаке', 'рюкзаки рюкзаков рюкзакам рюкзаки рюкзаками рюкзаках', 'additional'),
  exampleNoun('фонарь', 'lyhty', 'lantern', 'masculine', false, 'фонарь фонаря фонарю фонарь фонарём фонаре', 'фонари фонарей фонарям фонари фонарями фонарях', 'additional'),
  exampleNoun('карандаш', 'lyijykynä', 'pencil', 'masculine', false, 'карандаш карандаша карандашу карандаш карандашом карандаше', 'карандаши карандашей карандашам карандаши карандашами карандашах', 'additional'),
  exampleNoun('чемодан', 'matkalaukku', 'suitcase', 'masculine', false, 'чемодан чемодана чемодану чемодан чемоданом чемодане', 'чемоданы чемоданов чемоданам чемоданы чемоданами чемоданах', 'additional'),
  exampleNoun('блокнот', 'muistilehtiö', 'notepad', 'masculine', false, 'блокнот блокнота блокноту блокнот блокнотом блокноте', 'блокноты блокнотов блокнотам блокноты блокнотами блокнотах', 'additional'),
  exampleNoun('бинокль', 'kiikari', 'pair of binoculars', 'masculine', false, 'бинокль бинокля биноклю бинокль биноклем бинокле', 'бинокли биноклей биноклям бинокли биноклями биноклях', 'additional'),
  exampleNoun('термос', 'termospullo', 'thermos flask', 'masculine', false, 'термос термоса термосу термос термосом термосе', 'термосы термосов термосам термосы термосами термосах', 'additional'),
  exampleNoun('перчатка', 'käsine', 'glove', 'feminine', false, 'перчатка перчатки перчатке перчатку перчаткой/перчаткою перчатке', 'перчатки перчаток перчаткам перчатки перчатками перчатках', 'additional'),
  exampleNoun('куртка', 'takki', 'jacket', 'feminine', false, 'куртка куртки куртке куртку курткой/курткою куртке', 'куртки курток курткам куртки куртками куртках', 'additional'),
  exampleNoun('сумка', 'laukku', 'bag', 'feminine', false, 'сумка сумки сумке сумку сумкой/сумкою сумке', 'сумки сумок сумкам сумки сумками сумках', 'additional'),
  exampleNoun('коробка', 'laatikko', 'box', 'feminine', false, 'коробка коробки коробке коробку коробкой/коробкою коробке', 'коробки коробок коробкам коробки коробками коробках', 'additional'),
  exampleNoun('бутылка', 'pullo', 'bottle', 'feminine', false, 'бутылка бутылки бутылке бутылку бутылкой/бутылкою бутылке', 'бутылки бутылок бутылкам бутылки бутылками бутылках', 'additional'),
  exampleNoun('лопата', 'lapio', 'shovel', 'feminine', false, 'лопата лопаты лопате лопату лопатой/лопатою лопате', 'лопаты лопат лопатам лопаты лопатами лопатах', 'additional'),
  exampleNoun('скамейка', 'penkki', 'bench', 'feminine', false, 'скамейка скамейки скамейке скамейку скамейкой/скамейкою скамейке', 'скамейки скамеек скамейкам скамейки скамейками скамейках', 'additional'),
  exampleNoun('лестница', 'portaikko', 'staircase', 'feminine', false, 'лестница лестницы лестнице лестницу лестницей/лестницею лестнице', 'лестницы лестниц лестницам лестницы лестницами лестницах', 'additional'),
  exampleNoun('полка', 'hylly', 'shelf', 'feminine', false, 'полка полки полке полку полкой/полкою полке', 'полки полок полкам полки полками полках', 'additional'),
  exampleNoun('верёвка', 'köysi', 'rope', 'feminine', false, 'верёвка верёвки верёвке верёвку верёвкой/верёвкою верёвке', 'верёвки верёвок верёвкам верёвки верёвками верёвках', 'additional'),
  exampleNoun('окно', 'ikkuna', 'window', 'neuter', false, 'окно окна окну окно окном окне', 'окна окон окнам окна окнами окнах', 'additional'),
  exampleNoun('зеркало', 'peili', 'mirror', 'neuter', false, 'зеркало зеркала зеркалу зеркало зеркалом зеркале', 'зеркала зеркал зеркалам зеркала зеркалами зеркалах', 'additional'),
  exampleNoun('кресло', 'nojatuoli', 'armchair', 'neuter', false, 'кресло кресла креслу кресло креслом кресле', 'кресла кресел креслам кресла креслами креслах', 'additional'),
  exampleNoun('ведро', 'ämpäri', 'bucket', 'neuter', false, 'ведро ведра ведру ведро ведром ведре', 'вёдра вёдер вёдрам вёдра вёдрами вёдрах', 'additional'),
  exampleNoun('одеяло', 'peitto', 'blanket', 'neuter', false, 'одеяло одеяла одеялу одеяло одеялом одеяле', 'одеяла одеял одеялам одеяла одеялами одеялах', 'additional'),
  exampleNoun('полотенце', 'pyyhe', 'towel', 'neuter', false, 'полотенце полотенца полотенцу полотенце полотенцем полотенце', 'полотенца полотенец полотенцам полотенца полотенцами полотенцах', 'additional'),
  exampleNoun('письмо', 'kirje', 'letter', 'neuter', false, 'письмо письма письму письмо письмом письме', 'письма писем письмам письма письмами письмах', 'additional'),
  exampleNoun('расписание', 'aikataulu', 'schedule', 'neuter', false, 'расписание расписания расписанию расписание расписанием расписании', 'расписания расписаний расписаниям расписания расписаниями расписаниях', 'additional'),
  exampleNoun('упражнение', 'harjoite', 'exercise', 'neuter', false, 'упражнение упражнения упражнению упражнение упражнением упражнении', 'упражнения упражнений упражнениям упражнения упражнениями упражнениях', 'additional'),
  exampleNoun('помещение', 'huonetila', 'room', 'neuter', false, 'помещение помещения помещению помещение помещением помещении', 'помещения помещений помещениям помещения помещениями помещениях', 'additional'),
]

export interface CaseExample extends SingularExercise {
  number: GrammaticalNumber
  caseId: RussianCase
  explanationEn?: string
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
    ['бригада', '___ вернулись на базу.', 'Prikaatit palasivat tukikohtaan.', 'The brigades returned to base.', 'Palaava joukko on nominatiivissa.'],
    ['дорога', '___ закрыты.', 'Tiet on suljettu.', 'The roads are closed.', 'Suljetut tiet ovat lauseen subjekti.'],
    ['машина', '___ стоят у ворот.', 'Ajoneuvot ovat portilla.', 'The vehicles are by the gate.', 'Sijainnista kertovan lauseen subjekti on nominatiivissa.'],
    ['устройство', '___ работают исправно.', 'Laitteet toimivat moitteettomasti.', 'The devices are working properly.', 'Toimivat laitteet ovat lauseen subjekti.'],
    ['соединение', '___ прибыли утром.', 'Yhtymät saapuivat aamulla.', 'The formations arrived in the morning.', 'Saapuvat yhtymät ovat lauseen subjekti.'],
    ['занятие', '___ закончились в полдень.', 'Oppitunnit päättyivät keskipäivällä.', 'The lessons ended at noon.', 'Päättyvät oppitunnit ovat lauseen subjekti.'],
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
    ['батарея', 'На схеме отмечены позиции ___.', 'Kaavioon on merkitty patterien asemat.', 'The batteries’ positions are marked on the diagram.', 'Genetiivi kertoo, kenen asemista on kyse.'],
    ['деревня', 'Автобус проехал мимо ___.', 'Bussi ajoi kylien ohi.', 'The bus drove past the villages.', 'Мимо vaatii genetiivin.'],
    ['тропа', 'На карте нет ___.', 'Kartassa ei ole polkuja.', 'There are no trails on the map.', 'Нет vaatii genetiivin.'],
    ['устройство', 'В ящике нет ___.', 'Laatikossa ei ole laitteita.', 'There are no devices in the crate.', 'Нет vaatii genetiivin.'],
    ['озеро', 'Мы остановились возле ___.', 'Pysähdyimme järvien lähelle.', 'We stopped near the lakes.', 'Возле vaatii genetiivin.'],
    ['занятие', 'Перерыв начался после ___.', 'Tauko alkoi oppituntien jälkeen.', 'The break started after the lessons.', 'После vaatii genetiivin.'],
  ]),
  ...examples('dative', 'plural', [
    ['командир', 'Офицер передаёт приказ ___.', 'Upseeri välittää käskyn komentajille.', 'The officer passes the order to the commanders.', 'Datiivi ilmaisee vastaanottajaa.'],
    ['бригада', 'Штаб разослал ___ карты.', 'Esikunta lähetti kartat prikaateille.', 'Headquarters sent maps to the brigades.', 'Datiivi ilmaisee vastaanottajaa.'],
    ['дорога', 'Мы подошли к ___.', 'Tulimme teiden luo.', 'We approached the roads.', 'К vaatii datiivin.'],
    ['рота', 'Инструктор объяснил ___ правила.', 'Kouluttaja selitti säännöt komppanioille.', 'The instructor explained the rules to the companies.', 'Datiivi kertoo, kenelle säännöt selitettiin.'],
    ['отделение', 'Офицер раздал ___ инструкции.', 'Upseeri jakoi ohjeet ryhmille.', 'The officer handed out instructions to the squads.', 'Datiivi ilmaisee vastaanottajaa.'],
    ['озеро', 'Тропы ведут к ___.', 'Polut johtavat järville.', 'The trails lead to the lakes.', 'К vaatii datiivin.'],
    ['соединение', 'Штаб отправил ___ расписание.', 'Esikunta lähetti aikataulun yhtymille.', 'Headquarters sent the schedule to the formations.', 'Datiivi ilmaisee vastaanottajaa.'],
  ]),
  ...examples('accusative', 'plural', [
    ['машина', 'Механик проверяет ___.', 'Mekaanikko tarkastaa ajoneuvoja.', 'The mechanic is checking the vehicles.', 'Tarkastuksen kohde on akkusatiivissa.'],
    ['кабина', 'Механик осмотрел ___.', 'Mekaanikko tarkasti ohjaamot.', 'The mechanic inspected the cabs.', 'Tarkastuksen kohde on akkusatiivissa.'],
    ['улица', 'Мы пересекли ___.', 'Ylitimme kadut.', 'We crossed the streets.', 'Ylityksen kohde on akkusatiivissa.'],
    ['траншея', 'Инструктор показал нам ___.', 'Kouluttaja näytti meille juoksuhaudat.', 'The instructor showed us the trenches.', 'Näytettävä asia on akkusatiivissa.'],
    ['устройство', 'Техник заменил ___.', 'Teknikko vaihtoi laitteet.', 'The technician replaced the devices.', 'Vaihdettavat laitteet ovat akkusatiivissa.'],
    ['задание', 'Курсанты выполнили ___.', 'Kadetit suorittivat tehtävät.', 'The cadets completed the assignments.', 'Suoritettavat tehtävät ovat akkusatiivissa.'],
    ['препятствие', 'Группа заметила ___.', 'Ryhmä huomasi esteet.', 'The group spotted the obstacles.', 'Havainnon kohde on akkusatiivissa.'],
  ]),
  ...examples('instrumental', 'plural', [
    ['солдат', 'Командир говорит с ___.', 'Komentaja puhuu sotilaiden kanssa.', 'The commander speaks with the soldiers.', 'С vaatii instrumentaalin, kun se tarkoittaa jonkun kanssa.'],
    ['бригада', 'Генералы командуют ___.', 'Kenraalit komentavat prikaateja.', 'The generals command the brigades.', 'Командовать vaatii instrumentaalin.'],
    ['машина', 'Механик работает с ___.', 'Mekaanikko työskentelee ajoneuvojen parissa.', 'The mechanic works with the vehicles.', 'Работать с vaatii instrumentaalin.'],
    ['деревня', 'Между ___ есть тропа.', 'Kylien välissä on polku.', 'There is a trail between the villages.', 'Между vaatii instrumentaalin.'],
    ['устройство', 'Техники пользуются ___.', 'Teknikot käyttävät laitteita.', 'The technicians use the devices.', 'Пользоваться vaatii instrumentaalin.'],
    ['озеро', 'Между ___ проходит дорога.', 'Järvien välissä kulkee tie.', 'A road runs between the lakes.', 'Между vaatii instrumentaalin.'],
    ['крыло', 'Под ___ самолёта стоят ящики.', 'Lentokoneen siipien alla on laatikoita.', 'There are crates under the aircraft’s wings.', 'Под vaatii instrumentaalin, kun ilmaistaan sijaintia.'],
  ]),
  ...examples('prepositional', 'plural', [
    ['задача', 'Командир напоминает о ___.', 'Komentaja muistuttaa tehtävistä.', 'The commander reminds them about the tasks.', 'О ja prepositionaali ilmaisevat muistutuksen aihetta.'],
    ['кабина', 'В ___ лежат инструкции.', 'Ohjaamoissa on ohjeet.', 'There are instructions in the cabs.', 'В ja prepositionaali ilmaisevat sijaintia.'],
    ['траншея', 'Группы находятся в ___.', 'Ryhmät ovat juoksuhaudoissa.', 'The groups are in the trenches.', 'В ja prepositionaali ilmaisevat sijaintia.'],
    ['переправа', 'Инструктор рассказал о ___.', 'Kouluttaja kertoi ylityspaikoista.', 'The instructor spoke about the crossings.', 'Рассказать о vaatii prepositionaalin.'],
    ['устройство', 'В инструкции говорится об ___.', 'Ohjeessa kerrotaan laitteista.', 'The instructions describe the devices.', 'Об ilmaisee puheen aihetta ja vaatii prepositionaalin.'],
    ['задание', 'Инструктор напомнил о ___.', 'Kouluttaja muistutti tehtävistä.', 'The instructor gave a reminder about the assignments.', 'Напомнить о vaatii prepositionaalin.'],
    ['поле', 'На ___ лежит снег.', 'Pelloilla on lunta.', 'There is snow in the fields.', 'На ja prepositionaali ilmaisevat sijaintia.'],
  ]),
]

type Phrase = [nounLemma: string, adjectiveForms: string, fiLabel: string, enLabel: string, ru: string, fi: string, en: string]

interface CasePhraseExercise extends CaseExample {
  adjectiveForms: CaseForms
  translations: CaseNoun['translations']
}

function phrases(caseId: RussianCase, number: GrammaticalNumber, items: Phrase[]): CasePhraseExercise[] {
  return items.map(([lemma, adjectiveForms, fiLabel, enLabel, ru, fi, en]) => ({
    id: `phrase-${number}-${caseId}-${lemma}`,
    caseId, number, lemma, ru, fi, en,
    adjectiveForms: forms(adjectiveForms),
    translations: { fi: fiLabel, en: enLabel },
    difficulty: 'medium',
    explanation: 'Adjektiivi taipuu substantiivin suvun, luvun ja sijamuodon mukaan.',
    explanationEn: 'The adjective agrees with the noun in gender, number and case.',
  }))
}

// Adjective forms follow CASE_IDS, with the accusative matching the noun's animacy.
export const CASE_PHRASE_EXERCISES = [
  ...phrases('nominative', 'singular', [
    ['здание', 'старое старого старому старое старым старом', 'vanha rakennus', 'old building', 'Это ___.', 'Tämä on vanha rakennus.', 'This is an old building.'],
    ['радиостанция', 'новая новой новой новую новой новой', 'uusi radioasema', 'new radio station', '___ уже работает.', 'Uusi radioasema toimii jo.', 'The new radio station is already working.'],
  ]),
  ...phrases('genitive', 'singular', [
    ['фонарь', 'яркий яркого яркому яркий ярким ярком', 'kirkas lyhty', 'bright lantern', 'У нас нет ___.', 'Meillä ei ole kirkasta lyhtyä.', 'We do not have a bright lantern.'],
    ['куртка', 'тёплая тёплой тёплой тёплую тёплой тёплой', 'lämmin takki', 'warm jacket', 'Я вышел без ___.', 'Lähdin ulos ilman lämmintä takkia.', 'I went out without a warm jacket.'],
  ]),
  ...phrases('dative', 'singular', [
    ['офицер', 'новый нового новому нового новым новом', 'uusi upseeri', 'new officer', 'Я передал письмо ___.', 'Annoin kirjeen uudelle upseerille.', 'I handed the letter to the new officer.'],
    ['озеро', 'глубокое глубокого глубокому глубокое глубоким глубоком', 'syvä järvi', 'deep lake', 'Мы подошли к ___.', 'Tulimme syvän järven luo.', 'We approached the deep lake.'],
  ]),
  ...phrases('accusative', 'singular', [
    ['солдат', 'молодой молодого молодому молодого молодым молодом', 'nuori sotilas', 'young soldier', 'Я вижу ___.', 'Näen nuoren sotilaan.', 'I see a young soldier.'],
    ['перчатка', 'левая левой левой левую левой левой', 'vasen käsine', 'left glove', 'Я ищу ___.', 'Etsin vasenta käsinettä.', 'I am looking for the left glove.'],
  ]),
  ...phrases('instrumental', 'singular', [
    ['карандаш', 'красный красного красному красный красным красном', 'punainen lyijykynä', 'red pencil', 'Я рисую ___.', 'Piirrän punaisella lyijykynällä.', 'I draw with a red pencil.'],
    ['генерал', 'опытный опытного опытному опытного опытным опытном', 'kokenut kenraali', 'experienced general', 'Мы говорим с ___.', 'Juttelemme kokeneen kenraalin kanssa.', 'We are speaking with an experienced general.'],
  ]),
  ...phrases('prepositional', 'singular', [
    ['машина', 'новая новой новой новую новой новой', 'uusi auto', 'new car', 'Ключи в ___.', 'Avaimet ovat uudessa autossa.', 'The keys are in the new car.'],
    ['дом', 'большой большого большому большой большим большом', 'iso talo', 'big house', 'Мы живём в ___.', 'Asumme isossa talossa.', 'We live in a big house.'],
    ['сумка', 'синяя синей синей синюю синей синей', 'sininen laukku', 'blue bag', 'Книга лежит в ___.', 'Kirja on sinisessä laukussa.', 'The book is in the blue bag.'],
  ]),
  ...phrases('nominative', 'plural', [
    ['коробка', 'пустые пустых пустым пустые пустыми пустых', 'tyhjä laatikko', 'empty box', '___ стоят на полу.', 'Tyhjät laatikot ovat lattialla.', 'The empty boxes are on the floor.'],
  ]),
  ...phrases('genitive', 'plural', [
    ['полотенце', 'чистые чистых чистым чистые чистыми чистых', 'puhdas pyyhe', 'clean towel', 'У нас нет ___.', 'Meillä ei ole puhtaita pyyhkeitä.', 'We do not have any clean towels.'],
    ['письмо', 'новые новых новым новые новыми новых', 'uusi kirje', 'new letter', 'В ящике нет ___.', 'Laatikossa ei ole uusia kirjeitä.', 'There are no new letters in the box.'],
  ]),
  ...phrases('dative', 'plural', [
    ['деревня', 'соседние соседних соседним соседние соседними соседних', 'naapurikylä', 'neighbouring village', 'Эта дорога ведёт к ___.', 'Tämä tie johtaa naapurikyliin.', 'This road leads to the neighbouring villages.'],
    ['офицер', 'молодые молодых молодым молодых молодыми молодых', 'nuori upseeri', 'young officer', 'Генерал объяснил задачу ___.', 'Kenraali selitti tehtävän nuorille upseereille.', 'The general explained the task to the young officers.'],
  ]),
  ...phrases('accusative', 'plural', [
    ['задание', 'трудные трудных трудным трудные трудными трудных', 'vaikea tehtävä', 'difficult task', 'Мы выполняем ___.', 'Teemme vaikeita tehtäviä.', 'We are carrying out difficult tasks.'],
    ['солдат', 'опытные опытных опытным опытных опытными опытных', 'kokenut sotilas', 'experienced soldier', 'Командир вызвал ___.', 'Komentaja kutsui kokeneet sotilaat paikalle.', 'The commander summoned the experienced soldiers.'],
  ]),
  ...phrases('instrumental', 'plural', [
    ['устройство', 'современные современных современным современные современными современных', 'nykyaikainen laite', 'modern device', 'Техники пользуются ___.', 'Teknikot käyttävät nykyaikaisia laitteita.', 'The technicians use modern devices.'],
  ]),
  ...phrases('prepositional', 'plural', [
    ['кабина', 'новые новых новым новые новыми новых', 'uusi ohjaamo', 'new cab', 'В ___ лежат инструкции.', 'Uusissa ohjaamoissa on ohjeet.', 'There are instructions in the new cabs.'],
    ['поле', 'широкие широких широким широкие широкими широких', 'laaja pelto', 'wide field', 'На ___ лежит снег.', 'Laajoilla pelloilla on lunta.', 'There is snow in the wide fields.'],
  ]),
]

const examplesById = new Map([...CASE_EXAMPLES, ...CASE_PHRASE_EXERCISES].map(exercise => [exercise.id, exercise]))

export function caseExample(id: string): CaseExample | undefined {
  return examplesById.get(id)
}
